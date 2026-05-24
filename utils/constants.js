const CONFIG = {
  SALT_ROUNDS: 10,
  JWT_EXPIRES_IN: '8h',
  DEFAULT_CLIENT_ROLE: 'client',
  ERROR_CODES: {
    UNIQUE_VIOLATION: '23505'
  }
};

module.exports = CONFIG;