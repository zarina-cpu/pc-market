import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const envPath = path.join(root, ".env");
const text = fs.readFileSync(envPath, "utf8");
const pairs = [];
for (const line of text.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq < 1) continue;
  const name = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  if (value) pairs.push([name, value]);
}

const envFlag = "production,preview,development";
const secretNames = new Set([
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "TELEGRAM_BOT_TOKEN",
  "ADMIN_PASSWORD",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
]);

for (const [name, value] of pairs) {
  const args = ["env", "add", name, "--environment", envFlag, "--force", "-y"];
  if (secretNames.has(name)) args.push("--sensitive");
  const result = spawnSync("vercel", args, {
    cwd: root,
    encoding: "utf8",
    input: value,
    shell: false,
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || "");
    process.exit(result.status || 1);
  }
  process.stdout.write(`set ${name}\n`);
}
