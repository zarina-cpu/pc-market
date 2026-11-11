import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const dir = join("public", "products");
mkdirSync(dir, { recursive: true });

function svg(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2a2e2c"/>
      <stop offset="1" stop-color="#161917"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d8d4cc"/>
      <stop offset="1" stop-color="#8e8880"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="800" height="520" fill="url(#bg)"/>
  <circle cx="680" cy="70" r="120" fill="#c47a4a" opacity="0.12"/>
  ${inner}
</svg>`;
}

function cpu({ label, sub, gold = false, intel = false }) {
  const lid = gold ? "#c9a227" : "#cfd3d6";
  const board = intel ? "#1b4d2e" : "#2c2c2c";
  return svg(`
    <g filter="url(#s)" transform="translate(250 90)">
      <rect x="40" y="40" width="220" height="220" rx="8" fill="${board}"/>
      <rect x="68" y="68" width="164" height="164" rx="6" fill="${lid}"/>
      <rect x="78" y="78" width="144" height="144" rx="4" fill="#e8ecef" opacity="0.35"/>
      ${Array.from({ length: 8 }, (_, i) => `<circle cx="${70 + (i % 4) * 48}" cy="${278 + Math.floor(i / 4) * 18}" r="4" fill="#c47a4a"/>`).join("")}
    </g>
    <text x="400" y="430" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="28">${label}</text>
    <text x="400" y="462" text-anchor="middle" fill="#c47a4a" font-size="16">${sub}</text>
  `);
}

function board({ label, color, w = 420, h = 260 }) {
  return svg(`
    <g filter="url(#s)" transform="translate(${400 - w / 2} 110)">
      <rect width="${w}" height="${h}" rx="10" fill="${color}"/>
      <rect x="18" y="18" width="70" height="70" fill="#1a1a1a"/>
      <rect x="100" y="22" width="18" height="92" fill="#d8d4cc"/>
      <rect x="124" y="22" width="18" height="92" fill="#d8d4cc"/>
      <rect x="148" y="22" width="18" height="92" fill="#d8d4cc"/>
      <rect x="172" y="22" width="18" height="92" fill="#d8d4cc"/>
      <rect x="24" y="${h - 70}" width="${w - 80}" height="22" fill="#111"/>
      <rect x="${w - 48}" y="40" width="28" height="${h - 80}" fill="#222"/>
      <circle cx="${w - 24}" cy="28" r="8" fill="#c47a4a"/>
    </g>
    <text x="400" y="430" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
  `);
}

function ram({ label, color, sticks = 2 }) {
  const gap = 46;
  const start = 400 - ((sticks - 1) * gap) / 2;
  const sticksSvg = Array.from({ length: sticks }, (_, i) => {
    const x = start + i * gap - 18;
    return `<g transform="translate(${x} 90)">
      <rect width="36" height="250" rx="4" fill="${color}"/>
      <rect x="6" y="12" width="24" height="210" fill="#1b1d1c"/>
      <rect x="8" y="20" width="20" height="12" fill="#c47a4a"/>
      ${Array.from({ length: 9 }, (_, n) => `<rect x="4" y="${250 - 28 - n * 4}" width="28" height="2" fill="#d2b56a"/>`).join("")}
    </g>`;
  }).join("");
  return svg(`
    <g filter="url(#s)">${sticksSvg}</g>
    <text x="400" y="430" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
  `);
}

function gpu({ label, fans = 2, length = 340, color = "#1e2220" }) {
  const fan = (cx) => `
    <circle cx="${cx}" cy="70" r="48" fill="#111"/>
    <circle cx="${cx}" cy="70" r="14" fill="#c47a4a"/>
    <path d="M${cx} 70 l40 -8 l-8 18 z" fill="#9aa09a"/>
    <path d="M${cx} 70 l-12 38 l-14 -16 z" fill="#9aa09a"/>
    <path d="M${cx} 70 l-36 -18 l18 -8 z" fill="#9aa09a"/>
  `;
  const fanSvg = Array.from({ length: fans }, (_, i) =>
    fan(70 + i * ((length - 80) / Math.max(fans - 1, 1))),
  ).join("");
  return svg(`
    <g filter="url(#s)" transform="translate(${400 - length / 2} 160)">
      <rect width="${length}" height="140" rx="12" fill="${color}"/>
      <rect x="${length - 18}" y="10" width="12" height="120" fill="#888"/>
      ${fanSvg}
    </g>
    <text x="400" y="430" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
  `);
}

function drive({ label, kind }) {
  if (kind === "hdd") {
    return svg(`
      <g filter="url(#s)" transform="translate(220 140)">
        <rect width="360" height="200" rx="10" fill="#3a3a3a"/>
        <circle cx="250" cy="100" r="72" fill="#222"/>
        <circle cx="250" cy="100" r="18" fill="#c47a4a"/>
        <rect x="24" y="24" width="90" height="28" fill="#111"/>
      </g>
      <text x="400" y="430" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
    `);
  }
  if (kind === "sata") {
    return svg(`
      <g filter="url(#s)" transform="translate(250 150)">
        <rect width="300" height="180" rx="8" fill="#4a4a4a"/>
        <rect x="16" y="16" width="268" height="148" fill="#2b2b2b"/>
        <text x="150" y="100" text-anchor="middle" fill="#efe8dc" font-size="22">SATA SSD</text>
      </g>
      <text x="400" y="430" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
    `);
  }
  const w = kind === "long" ? 280 : 220;
  return svg(`
    <g filter="url(#s)" transform="translate(${400 - w / 2} 190)">
      <rect width="${w}" height="90" rx="6" fill="#1a1a1a"/>
      <rect x="10" y="10" width="${w - 20}" height="70" fill="#c47a4a" opacity="0.85"/>
      <rect x="18" y="38" width="${w - 36}" height="14" fill="#111"/>
    </g>
    <text x="400" y="430" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
  `);
}

function psu({ label, watts }) {
  const w = watts >= 800 ? 300 : watts >= 700 ? 270 : 240;
  return svg(`
    <g filter="url(#s)" transform="translate(${400 - w / 2} 150)">
      <rect width="${w}" height="170" rx="8" fill="#d8d4cc"/>
      <circle cx="${w / 2}" cy="78" r="58" fill="#222"/>
      <circle cx="${w / 2}" cy="78" r="18" fill="#c47a4a"/>
      <rect x="${w - 40}" y="20" width="22" height="40" rx="4" fill="#333"/>
      <text x="${w / 2}" y="158" text-anchor="middle" fill="#1d1a16" font-size="20">${watts} W</text>
    </g>
    <text x="400" y="430" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
  `);
}

function pcCase({ label, compact = false, mesh = false }) {
  const h = compact ? 220 : 300;
  const w = compact ? 160 : 190;
  return svg(`
    <g filter="url(#s)" transform="translate(${400 - w / 2} ${compact ? 120 : 80})">
      <rect width="${w}" height="${h}" rx="8" fill="#1c1f1e"/>
      <rect x="10" y="12" width="${w - 20}" height="${h - 36}" fill="${mesh ? "#2b3030" : "#111"}"/>
      ${Array.from({ length: 9 }, (_, r) =>
        Array.from(
          { length: 5 },
          (_, c) =>
            `<circle cx="${28 + c * 28}" cy="${36 + r * 26}" r="5" fill="#6a706c" opacity="0.7"/>`,
        ).join(""),
      ).join("")}
      <rect x="14" y="${h - 18}" width="${w - 28}" height="8" fill="#c47a4a"/>
    </g>
    <text x="400" y="450" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
  `);
}

function cooler({ label, kind }) {
  if (kind === "aio") {
    return svg(`
      <g filter="url(#s)">
        <rect x="140" y="140" width="220" height="160" rx="8" fill="#2a2a2a"/>
        <circle cx="250" cy="220" r="54" fill="#111"/>
        <circle cx="250" cy="220" r="16" fill="#c47a4a"/>
        <path d="M360 180 C480 140 520 200 620 170" stroke="#7a8a9a" stroke-width="16" fill="none"/>
        <rect x="560" y="120" width="120" height="200" rx="6" fill="#3a3f3c"/>
      </g>
      <text x="400" y="450" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
    `);
  }
  if (kind === "low") {
    return svg(`
      <g filter="url(#s)" transform="translate(270 170)">
        <rect width="260" height="90" rx="6" fill="#b8b2a8"/>
        <circle cx="130" cy="45" r="34" fill="#222"/>
        <circle cx="130" cy="45" r="10" fill="#c47a4a"/>
      </g>
      <text x="400" y="430" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
    `);
  }
  return svg(`
    <g filter="url(#s)" transform="translate(300 80)">
      <rect x="70" y="20" width="60" height="280" fill="#cfd3d6"/>
      ${Array.from({ length: 18 }, (_, i) => `<rect x="40" y="${24 + i * 14}" width="120" height="6" fill="#9aa0a6"/>`).join("")}
      <rect x="55" y="300" width="90" height="18" fill="#c47a4a"/>
      <circle cx="100" cy="160" r="70" fill="#1b1d1c" opacity="0.15"/>
    </g>
    <text x="400" y="450" text-anchor="middle" fill="#efe8dc" font-family="Georgia, serif" font-size="24">${label}</text>
  `);
}

const files = {
  "ryzen-5-5600": cpu({ label: "Ryzen 5 5600", sub: "AM4 · 6 ядер" }),
  "ryzen-7-5800x3d": cpu({ label: "Ryzen 7 5800X3D", sub: "AM4 · 3D V-Cache", gold: true }),
  "ryzen-5-7600": cpu({ label: "Ryzen 5 7600", sub: "AM5 · DDR5" }),
  "ryzen-7-7800x3d": cpu({ label: "Ryzen 7 7800X3D", sub: "AM5 · эталон FPS", gold: true }),
  "i5-12400f": cpu({ label: "Core i5-12400F", sub: "LGA1700", intel: true }),
  "i7-14700k": cpu({ label: "Core i7-14700K", sub: "LGA1700 · K", intel: true, gold: true }),
  "b550-steel": board({ label: "B550 Steel Legend", color: "#4d5a63" }),
  "x570-aorus": board({ label: "X570 Aorus Elite", color: "#1a1a1a" }),
  "b650-tomahawk": board({ label: "B650 Tomahawk", color: "#243038" }),
  "x670e-gaming": board({ label: "X670E TUF Gaming", color: "#2b2718" }),
  "b760m-ddr4": board({ label: "B760M DDR4", color: "#3a4650", w: 320, h: 220 }),
  "z790-ddr5": board({ label: "Z790-P DDR5", color: "#151820" }),
  "ddr4-16-3200": ram({ label: "DDR4 16 ГБ 3200", color: "#1c1c1c", sticks: 2 }),
  "ddr4-32-3600": ram({ label: "DDR4 32 ГБ 3600", color: "#7a1f1a", sticks: 2 }),
  "ddr5-32-6000": ram({ label: "DDR5 32 ГБ 6000", color: "#d8d4cc", sticks: 2 }),
  "ddr5-64-6400": ram({ label: "DDR5 64 ГБ 6400", color: "#2a2a2a", sticks: 2 }),
  "ddr5-16-single": ram({ label: "DDR5 16 ГБ одна планка", color: "#6b6560", sticks: 1 }),
  "rtx-3050": gpu({ label: "RTX 3050 8 ГБ", fans: 2, length: 280, color: "#2a3038" }),
  "rtx-4060": gpu({ label: "RTX 4060 8 ГБ", fans: 2, length: 300, color: "#1b2420" }),
  "rx-7800-xt": gpu({ label: "RX 7800 XT 16 ГБ", fans: 2, length: 330, color: "#1a2740" }),
  "rtx-4070-super": gpu({ label: "RTX 4070 Super 12 ГБ", fans: 2, length: 340, color: "#203028" }),
  "rtx-4080-super": gpu({ label: "RTX 4080 Super 16 ГБ", fans: 3, length: 400, color: "#141418" }),
  "ssd-1tb-nvme": drive({ label: "NVMe 1 ТБ", kind: "m2" }),
  "ssd-2tb-nvme": drive({ label: "NVMe 2 ТБ", kind: "long" }),
  "ssd-1tb-sata": drive({ label: "SATA SSD 1 ТБ", kind: "sata" }),
  "hdd-2tb": drive({ label: "HDD 2 ТБ", kind: "hdd" }),
  "psu-550": psu({ label: "Блок 550 Вт", watts: 550 }),
  "psu-750": psu({ label: "Блок 750 Вт", watts: 750 }),
  "psu-850": psu({ label: "Блок 850 Вт", watts: 850 }),
  "case-compact": pcCase({ label: "Компактный корпус", compact: true }),
  "case-mid": pcCase({ label: "Lian Li Lancool 216", mesh: true }),
  "case-mesh": pcCase({ label: "Deepcool CC560", mesh: true }),
  "cooler-low": cooler({ label: "Низкий кулер", kind: "low" }),
  "cooler-tower": cooler({ label: "Башня AK400", kind: "tower" }),
  "cooler-aio": cooler({ label: "СЖО 280 мм", kind: "aio" }),
};

for (const [slug, content] of Object.entries(files)) {
  writeFileSync(join(dir, `${slug}.svg`), content);
}
console.log(`Wrote ${Object.keys(files).length} product images`);
