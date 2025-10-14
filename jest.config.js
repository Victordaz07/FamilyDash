module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  setupFiles: ["<rootDir>/tests/setup.js"]
};