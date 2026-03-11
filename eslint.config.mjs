import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals"; //this one includes the eslint-plugin-jsx-a11y plugin for catching accessibility issues.
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig(
  [
    ...nextVitals,
    ...nextTs,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  ],
  {
    settings: {
      react: { version: "19" }, // Avoids auto-detection crash
    },
  },
);

export default eslintConfig;
