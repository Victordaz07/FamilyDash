// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    "@react-native-community",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: 2021, sourceType: "module" },
  plugins: ["@typescript-eslint", "import"],
  settings: {
    "import/resolver": {
      typescript: { project: "./tsconfig.json" }
    }
  },
  rules: {
    // Bloquea rutas relativas profundas: fuerza alias "@/..."
    "no-restricted-imports": ["error", {
      patterns: ["../*", "../../*", "../../../*", "../../../../*"]
    }],
    "import/order": ["warn", {
      "groups": ["builtin", "external", "internal", ["parent", "sibling", "index"]],
      "newlines-between": "always",
      "alphabetize": { order: "asc", caseInsensitive: true }
    }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
  }
};