/**
 * OVERLOAD - Mind Rush Arcade Engine
 * Decoupled controller coordinating combat health, energy meters, chain multipliers,
 * multi-phase boss battles, and session summaries for Mind Rush.
 */

import {
  MIND_RUSH_MODES,
  SESSION_TYPES,
  MIND_RUSH_DIFFICULTY_PARAMS,
  COMBAT_PARAMS,
} from './mindRushConstants.js';
import { generateMindRushTask } from './mindRushGenerator.js';
import { evaluateMindRushResponse } from './mindRushEvaluator.js';
import { calculateNextMindRushDifficulty } from './mindRushDifficulty.js';

export class MindRushEngine {
  constructor({
    mode = MIND_RUSH_MODES.BLAST_LOGIC,
    sessionType = SESSION_TYPES.QUICK,
    initialDifficulty = MIND_RUSH_DIFFICULTY_PARAMS.initialLevel,
  } = {}) {
    this.mode = mode;
    this.sessionType = sessionType;
    this.currentLevel = Math.max(1, Math.min(10, initialDifficulty));
    this.roundNumber = 0;

    this.currentTask = null;
    this.currentCombo = 0;
    this.bestCombo = 0;
    this.totalScore = 0;

    // Combat state
    this.playerHealth = COMBAT_PARAMS.PLAYER_MAX_HEALTH;
    this.bossHealth = COMBAT_PARAMS.BOSS_MAX_HEALTH;
    this.bossDamageTotal = 0;
    this.currentPhase = 1;
    this.energy = 0;
    this.bestChain = 0;

    this.consecutiveCorrect = 0;
    this.consecutiveErrors = 0;
    this.sessionHistory = [];
    this.peakLevelReached = this.currentLevel;

    this.maxRounds =
      mode === MIND_RUSH_MODES.BOSS_BREAKER
        ? null // Finished on boss health <= 0 or player health <= 0
        : sessionType === SESSION_TYPES.QUICK
        ? MIND_RUSH_DIFFICULTY_PARAMS.quickRounds
        : sessionType === SESSION_TYPES.STANDARD
        ? MIND_RUSH_DIFFICULTY_PARAMS.standardRounds
        : null;
  }

  /**
   * Starts and returns the next dynamic arcade challenge.
   */
  startNextTask() {
    this.roundNumber += 1;
    this.currentTask = generateMindRushTask({
      mode: this.mode,
      difficultyLevel: this.currentLevel,
      roundNumber: this.roundNumber,
      currentPhase: this.currentPhase,
    });
    return this.currentTask;
  }

  /**
   * Submits user response for the active arcade round.
   */
  submitResponse(userResponse = null, responseTimeMs = 0, isTimedOut = false) {
    if (!this.currentTask) {
      throw new Error('No active Mind Rush task to evaluate.');
    }

    const evaluation = evaluateMindRushResponse({
      task: this.currentTask,
      userResponse,
      responseTimeMs,
      isTimedOut,
      currentCombo: this.currentCombo,
    });

    if (evaluation.isCorrect) {
      this.currentCombo += 1;
      this.consecutiveCorrect += 1;
      this.consecutiveErrors = 0;
      this.totalScore = Math.max(0, this.totalScore + evaluation.pointsAwarded);
      if (this.currentCombo > this.bestCombo) {
        this.bestCombo = this.currentCombo;
      }

      // Energy charge
      this.energy = Math.min(COMBAT_PARAMS.ENERGY_MAX, this.energy + COMBAT_PARAMS.ENERGY_PER_HIT);

      // Chain reaction tracking
      if (evaluation.chainCount && evaluation.chainCount > this.bestChain) {
        this.bestChain = evaluation.chainCount;
      }

      // Boss combat updates
      if (this.mode === MIND_RUSH_MODES.BOSS_BREAKER) {
        const dmg = evaluation.damageDealt || COMBAT_PARAMS.DAMAGE_PER_HIT;
        this.bossHealth = Math.max(0, this.bossHealth - dmg);
        this.bossDamageTotal += dmg;
        this.currentPhase = Math.min(5, Math.floor((COMBAT_PARAMS.BOSS_MAX_HEALTH - this.bossHealth) / 100) + 1);
      }
    } else {
      this.currentCombo = 0;
      this.consecutiveCorrect = 0;
      this.consecutiveErrors += 1;
      this.totalScore = Math.max(0, this.totalScore - evaluation.penaltyPoints);
      this.energy = Math.max(0, this.energy - 15);

      // Player takes damage in boss combat
      if (this.mode === MIND_RUSH_MODES.BOSS_BREAKER) {
        this.playerHealth = Math.max(0, this.playerHealth - COMBAT_PARAMS.PLAYER_DAMAGE_TAKEN);
      }
    }

    this.sessionHistory.push(evaluation);

    // Calculate adaptive difficulty
    const nextDiff = calculateNextMindRushDifficulty({
      currentLevel: this.currentLevel,
      recentEvaluations: this.sessionHistory,
      consecutiveCorrect: this.consecutiveCorrect,
      consecutiveErrors: this.consecutiveErrors,
    });

    this.currentLevel = nextDiff.nextLevel;
    if (this.currentLevel > this.peakLevelReached) {
      this.peakLevelReached = this.currentLevel;
    }

    // Determine session completion
    let isSessionFinished = false;
    if (this.mode === MIND_RUSH_MODES.BOSS_BREAKER) {
      isSessionFinished = this.bossHealth <= 0 || this.playerHealth <= 0;
    } else if (this.maxRounds !== null) {
      isSessionFinished = this.roundNumber >= this.maxRounds;
    }

    return {
      evaluation,
      nextDifficulty: nextDiff,
      currentCombo: this.currentCombo,
      bestCombo: this.bestCombo,
      totalScore: this.totalScore,
      energy: this.energy,
      playerHealth: this.playerHealth,
      bossHealth: this.bossHealth,
      currentPhase: this.currentPhase,
      isSessionFinished,
      isBossDefeated: this.bossHealth <= 0,
      sessionSummary: this.getSessionSummary(),
    };
  }

  /**
   * Triggers a Special Attack when energy reaches 100%.
   */
  triggerSpecialAttack() {
    if (this.energy < COMBAT_PARAMS.ENERGY_MAX) return null;
    this.energy = 0;
    this.totalScore += 300;

    if (this.mode === MIND_RUSH_MODES.BOSS_BREAKER) {
      const dmg = COMBAT_PARAMS.SPECIAL_ATTACK_DAMAGE;
      this.bossHealth = Math.max(0, this.bossHealth - dmg);
      this.bossDamageTotal += dmg;
      this.currentPhase = Math.min(5, Math.floor((COMBAT_PARAMS.BOSS_MAX_HEALTH - this.bossHealth) / 100) + 1);
    }

    return {
      specialActivated: true,
      bossHealth: this.bossHealth,
      currentPhase: this.currentPhase,
      isBossDefeated: this.bossHealth <= 0,
    };
  }

  /**
   * Evaluates a timeout when no action is taken before deadline.
   */
  handleTimeout() {
    return this.submitResponse(null, this.currentTask?.timeoutWindowMs || 8000, true);
  }

  /**
   * Produces aggregated session summary telemetry.
   */
  getSessionSummary() {
    const totalRounds = this.sessionHistory.length;
    if (totalRounds === 0) {
      return {
        gameType: 'mind-rush',
        facultyId: 'mind-rush',
        mode: this.mode,
        totalRounds: 0,
        correctCount: 0,
        incorrectCount: 0,
        timedOutCount: 0,
        averageAccuracy: 0,
        averageResponseTimeMs: 0,
        bestResponseTimeMs: 0,
        bestCombo: 0,
        bestChain: 0,
        bossDamage: 0,
        isBossDefeated: false,
        totalScore: 0,
        difficultyReached: this.currentLevel,
        peakLevel: this.peakLevelReached,
      };
    }

    const correctCount = this.sessionHistory.filter((e) => e.isCorrect).length;
    const timedOutCount = this.sessionHistory.filter((e) => e.isTimedOut).length;
    const incorrectCount = totalRounds - correctCount;

    const averageAccuracy = Math.round((correctCount / totalRounds) * 100);

    const validResponseTimes = this.sessionHistory
      .filter((e) => e.isCorrect && e.responseTimeMs > 0)
      .map((e) => e.responseTimeMs);

    const averageResponseTimeMs =
      validResponseTimes.length > 0
        ? Math.round(validResponseTimes.reduce((sum, t) => sum + t, 0) / validResponseTimes.length)
        : 0;

    const bestResponseTimeMs =
      validResponseTimes.length > 0 ? Math.min(...validResponseTimes) : 0;

    return {
      gameType: 'mind-rush',
      facultyId: 'mind-rush',
      mode: this.mode,
      totalRounds,
      correctCount,
      incorrectCount,
      timedOutCount,
      averageAccuracy,
      averageResponseTimeMs,
      bestResponseTimeMs,
      bestCombo: this.bestCombo,
      bestChain: this.bestChain,
      bossDamage: this.bossDamageTotal,
      isBossDefeated: this.bossHealth <= 0,
      totalScore: this.totalScore,
      difficultyReached: this.currentLevel,
      peakLevel: this.peakLevelReached,
    };
  }
}

export default MindRushEngine;
