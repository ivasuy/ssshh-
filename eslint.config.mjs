import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow using 'any'
      "react-hooks/exhaustive-deps": "warn", // Change exhaustive deps to warning instead of error
      "react/no-unescaped-entities": "off", // Prevent errors for using unescaped characters like apostrophes
      "jsx-a11y/anchor-is-valid": "off", // Disable warnings for invalid anchor tags
      "@next/next/no-img-element": "off", // Allow using <img> instead of <Image> from Next.js
      "import/no-anonymous-default-export": "off", // Disable requirement for named exports
    },
  }),
];

export default eslintConfig;
