import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Asset công khai, không phải code của repo — pdf.worker.min.mjs là bản
    // build đã minify copy từ pdfjs-dist (xem scripts/copy-pdf-worker.mjs).
    "public/**",
  ]),
]);

export default eslintConfig;
