// Sao chép worker script của pdfjs-dist vào public/ để phục vụ tĩnh.
// Chạy tự động sau `npm install` (xem "postinstall" trong package.json) —
// file đích không commit vào git vì gắn chặt với đúng bản pdfjs-dist đã cài.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(rootDir, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const targetDir = join(rootDir, "public");
const target = join(targetDir, "pdf.worker.min.mjs");

if (!existsSync(source)) {
  console.warn("[copy-pdf-worker] Không tìm thấy pdfjs-dist, bỏ qua.");
  process.exit(0);
}

if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
console.log("[copy-pdf-worker] Đã sao chép pdf.worker.min.mjs vào public/.");
