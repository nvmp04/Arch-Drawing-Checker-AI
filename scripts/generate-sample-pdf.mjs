// Sinh một file PDF nhiều trang để đứng thay cho bản vẽ PDF thật (giai đoạn
// mock, chưa có backend lưu file upload thật). Viết PDF thô bằng tay, không
// phụ thuộc thư viện nào — chỉ chạy một lần lúc dựng dữ liệu mock, không nằm
// trong runtime của app. Nội dung mỗi trang là vài hình chữ nhật/đường kẻ mô
// phỏng mặt bằng kiến trúc + nhãn số trang, đủ để test pan/zoom + khoanh vùng.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PAGE_COUNT = 32;
const PAGE_WIDTH = 1000;
const PAGE_HEIGHT = 700;

/** RNG thuần, seed cố định để lần chạy nào cũng ra cùng một file. */
function makeRng(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function buildPageContent(pageNumber) {
  const rng = makeRng(pageNumber * 97 + 13);
  const ops = [];

  ops.push("q 1.5 w 0 0 0 RG");
  ops.push(`40 40 ${PAGE_WIDTH - 80} ${PAGE_HEIGHT - 80} re S`);

  // Vài "phòng" hình chữ nhật ngẫu nhiên (seed cố định) mô phỏng mặt bằng.
  const roomCount = 5 + Math.floor(rng() * 4);
  ops.push("0.8 w 0.25 0.25 0.25 RG");
  for (let i = 0; i < roomCount; i += 1) {
    const x = 70 + rng() * (PAGE_WIDTH - 220);
    const y = 90 + rng() * (PAGE_HEIGHT - 220);
    const w = 60 + rng() * 140;
    const h = 50 + rng() * 100;
    ops.push(`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re S`);
  }

  // Vài đường kích thước ngắn cho có cảm giác bản vẽ kỹ thuật.
  ops.push("0.5 w 0.5 0.5 0.5 RG");
  for (let i = 0; i < 6; i += 1) {
    const x1 = 60 + rng() * (PAGE_WIDTH - 120);
    const y1 = 60 + rng() * (PAGE_HEIGHT - 120);
    const x2 = x1 + (rng() - 0.5) * 160;
    const y2 = y1 + (rng() - 0.5) * 160;
    ops.push(`${x1.toFixed(1)} ${y1.toFixed(1)} m ${x2.toFixed(1)} ${y2.toFixed(1)} l S`);
  }

  ops.push("0 0 0 rg BT /F1 22 Tf 60 " + (PAGE_HEIGHT - 70) + " Td (MOCK DRAWING - PAGE " + pageNumber + ") Tj ET");
  ops.push("0.4 0.4 0.4 rg BT /F1 10 Tf 60 60 Td (Arch Drawing Checker AI - mock sample, not a real drawing) Tj ET");
  ops.push("Q");

  return ops.join("\n");
}

function buildPdf() {
  const objects = [];
  const pageObjectIds = [];
  const contentObjectIds = [];

  // id 1 = Catalog, id 2 = Pages, id 3 = Font — đặt trước, trang bắt đầu từ id 4.
  const catalogId = 1;
  const pagesId = 2;
  const fontId = 3;
  let nextId = 4;

  for (let i = 0; i < PAGE_COUNT; i += 1) {
    pageObjectIds.push(nextId++);
    contentObjectIds.push(nextId++);
  }

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId] =
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${PAGE_COUNT} >>`;
  objects[fontId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;

  for (let i = 0; i < PAGE_COUNT; i += 1) {
    const pageNumber = i + 1;
    const pageId = pageObjectIds[i];
    const contentId = contentObjectIds[i];
    const content = buildPageContent(pageNumber);

    objects[pageId] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = { stream: content };
  }

  const header = "%PDF-1.4\n";
  let body = "";
  const offsets = new Array(nextId).fill(0);
  let offset = Buffer.byteLength(header, "latin1");

  for (let id = 1; id < nextId; id += 1) {
    offsets[id] = offset;
    const value = objects[id];
    let objectText;
    if (typeof value === "string") {
      objectText = `${id} 0 obj\n${value}\nendobj\n`;
    } else {
      const stream = value.stream;
      objectText =
        `${id} 0 obj\n<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream\nendobj\n`;
    }
    body += objectText;
    offset += Buffer.byteLength(objectText, "latin1");
  }

  const xrefStart = offset;
  let xref = `xref\n0 ${nextId}\n0000000000 65535 f \n`;
  for (let id = 1; id < nextId; id += 1) {
    xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }

  const trailer =
    `trailer\n<< /Size ${nextId} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return header + body + xref + trailer;
}

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const targetDir = join(rootDir, "public/mock");
const target = join(targetDir, "sample-drawing.pdf");

import { existsSync, mkdirSync } from "node:fs";
if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

writeFileSync(target, buildPdf(), "latin1");
console.log(`[generate-sample-pdf] Đã tạo ${PAGE_COUNT} trang tại ${target}`);
