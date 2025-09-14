import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
// import stylistic from 'eslint-plugin-stylistic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    ignores: ['jest.config.js', 'coverage/**', 'eslint.config.mjs'],
    extends: compat.extends("airbnb-base", "airbnb-typescript/base"),

    plugins: {
        '@typescript-eslint': tsEslint,
        // 'stylistic': stylistic, // Add the stylistic plugin
    },
    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: './tsconfig.json', // Path to your tsconfig.json
            tsconfigRootDir: import.meta.dirname, // Or __dirname if using CommonJS
            ecmaVersion: 2022, // Or your target ECMAScript version
            sourceType: 'module',
        },
        parser: tsParser,
    },

    rules: {
        'import/extensions': 'off',
        // https://github.com/iamturns/eslint-config-airbnb-typescript/issues/354#issuecomment-2265754435

        "@typescript-eslint/lines-between-class-members": "off",
        "@typescript-eslint/no-throw-literal": "off",
        "@typescript-eslint/only-throw-error": "error",

        // Already disabled by `prettier-eslint`, if you're using that.
        "@typescript-eslint/brace-style": "off",
        "@typescript-eslint/comma-dangle": "off",
        "@typescript-eslint/comma-spacing": "off",
        "@typescript-eslint/func-call-spacing": "off",
        "@typescript-eslint/keyword-spacing": "off",
        "@typescript-eslint/no-extra-parens": "off",
        "@typescript-eslint/no-extra-semi": "off",
        "@typescript-eslint/object-curly-spacing": "off",
        "@typescript-eslint/semi": "off",
        "@typescript-eslint/space-before-blocks": "off",
        "@typescript-eslint/space-before-function-paren": "off",
        "@typescript-eslint/space-infix-ops": "off",
        "@typescript-eslint/quotes": 0,
        "@typescript-eslint/indent": "off",

        // Deprecated, but not breaking yet
        "@typescript-eslint/no-loss-of-precision": "off",
        /// ///////////////
        "max-len": ["error", {
            code: 140,
            ignoreUrls: true,
            ignoreRegExpLiterals: true,
            ignoreTemplateLiterals: true,
            ignoreComments: true,
            ignorePattern: "require",
        }],

        "import/order": ["error", {
            groups: [
                ["builtin", "external"],
                "internal",
                ["parent", "sibling", "index"],
                "object",
                "type",
            ],

            "newlines-between": "always",
        }],

        "no-continue": "off",
        "no-plusplus": "off",
        "no-await-in-loop": "off",
        "no-mixed-operators": "off",
        "import/prefer-default-export": "off",

        "@typescript-eslint/consistent-type-imports": ["error", {
            prefer: "type-imports",
        }],

        "no-unused-vars": ["warn", {
            argsIgnorePattern: "_",
            varsIgnorePattern: "_",
        }],

        "@typescript-eslint/no-unused-vars": "off",
        "class-methods-use-this": "off",
        "max-classes-per-file": "off",
    },
}]);
