// Shared frontmatter helpers for the analyses pipeline.
//
// Convention: every analysis .md file begins with a fenced block whose values
// are valid JSON. This keeps parsing trivial and bulletproof for values that
// contain colons, commas, quotes, ₹ symbols, etc.
//
//   ---
//   title: "Ather Energy — Deep Dive Analysis"
//   ticker: "ATHERENERG"
//   date: "2026-07-03"
//   tags: ["EV", "E2W", "auto"]
//   summary: "Revenue accelerating 70% YoY..."
//   model: "deepseek-chat"
//   ---
//
// The `slug` is intentionally NOT stored here — it is derived from the file
// name so there is exactly one source of truth for it.

const FENCE = '---';

/**
 * Split a raw .md string into { data, body }.
 * Lenient on read: values are JSON-parsed when possible, otherwise kept as a
 * trimmed string. Files without a frontmatter block yield an empty `data`.
 */
export function parseFrontmatter(raw) {
  const text = raw.replace(/^﻿/, ''); // strip BOM
  if (!text.startsWith(FENCE)) return { data: {}, body: text };

  const lines = text.split(/\r?\n/);
  // lines[0] === '---'; find the closing fence.
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === FENCE) {
      end = i;
      break;
    }
  }
  if (end === -1) return { data: {}, body: text };

  const data = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();
    data[key] = parseValue(rawValue);
  }

  const body = lines.slice(end + 1).join('\n').replace(/^\n+/, '');
  return { data, body };
}

function parseValue(rawValue) {
  try {
    return JSON.parse(rawValue);
  } catch {
    return rawValue;
  }
}

/**
 * Serialize a plain object into a frontmatter block (JSON-valued), followed by
 * a single blank line. Key order is preserved as given.
 */
export function serializeFrontmatter(data) {
  const lines = [FENCE];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push(FENCE, '');
  return lines.join('\n') + '\n';
}

/** Return the body with any leading frontmatter block removed. */
export function stripFrontmatter(raw) {
  return parseFrontmatter(raw).body;
}
