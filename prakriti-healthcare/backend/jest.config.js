/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/src/tests/setupEnv.ts"],
  clearMocks: true,
};
