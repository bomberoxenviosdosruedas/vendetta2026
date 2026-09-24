import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-plugin-react@7.37 no soporta settings.react.version='detect'
  // con ESLint 10 (usa context.getFilename()). Fijamos la versión instalada.
  {
    settings: {
      react: { version: "19.3.0" },
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prisma/datosactuales/**",
    ".agents/**",
    "docs/**",
  ]),
]);