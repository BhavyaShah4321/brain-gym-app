/**
 * OVERLOAD - Spatial Navigation BFS Pathfinder
 * Deterministic shortest-path calculation and grid graph connectivity validation.
 */

/**
 * Executes Breadth-First Search (BFS) to find shortest route from start to target.
 *
 * @param {Object} params
 * @param {number} params.gridSize - 3, 4, 5, or 6
 * @param {Object} params.start - { row, col }
 * @param {Object} params.target - { row, col }
 * @param {Array<Object>|Set<number>} params.obstacles - Array of { row, col } or Set of cell indices
 * @returns {Object} { isReachable: boolean, shortestDistance: number, optimalPath: Array<{ row, col, index }> }
 */
export function findShortestPath({
  gridSize = 4,
  start = { row: 0, col: 0 },
  target = { row: 3, col: 3 },
  obstacles = [],
}) {
  const obstacleIndices =
    obstacles instanceof Set
      ? obstacles
      : new Set(obstacles.map((o) => o.row * gridSize + o.col));

  const startIndex = start.row * gridSize + start.col;
  const targetIndex = target.row * gridSize + target.col;

  if (obstacleIndices.has(startIndex) || obstacleIndices.has(targetIndex)) {
    return { isReachable: false, shortestDistance: Infinity, optimalPath: [] };
  }

  if (startIndex === targetIndex) {
    return { isReachable: true, shortestDistance: 0, optimalPath: [{ ...start, index: startIndex }] };
  }

  const queue = [{ row: start.row, col: start.col, path: [{ ...start, index: startIndex }] }];
  const visited = new Set([startIndex]);

  const directions = [
    [-1, 0], // UP
    [1, 0],  // DOWN
    [0, -1], // LEFT
    [0, 1],  // RIGHT
  ];

  while (queue.length > 0) {
    const { row, col, path } = queue.shift();
    const currentIndex = row * gridSize + col;

    if (currentIndex === targetIndex) {
      return {
        isReachable: true,
        shortestDistance: path.length - 1, // Number of movement steps
        optimalPath: path,
      };
    }

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      const nIndex = nr * gridSize + nc;

      if (
        nr >= 0 &&
        nr < gridSize &&
        nc >= 0 &&
        nc < gridSize &&
        !obstacleIndices.has(nIndex) &&
        !visited.has(nIndex)
      ) {
        visited.add(nIndex);
        queue.push({
          row: nr,
          col: nc,
          path: [...path, { row: nr, col: nc, index: nIndex }],
        });
      }
    }
  }

  return {
    isReachable: false,
    shortestDistance: Infinity,
    optimalPath: [],
  };
}

export default {
  findShortestPath,
};
