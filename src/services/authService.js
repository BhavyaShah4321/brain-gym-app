/**
 * OVERLOAD Authentication Service
 * User authentication abstraction (guest, credentials, Google Auth)
 */

export const authService = {
  async getCurrentUser() {
    return {
      isGuest: true,
      uid: 'guest_user_local',
      displayName: 'Operator',
    };
  },

  async signInAsGuest() {
    return {
      isGuest: true,
      uid: 'guest_user_local',
      displayName: 'Operator',
    };
  },

  async signOut() {
    return true;
  },
};

export default authService;
