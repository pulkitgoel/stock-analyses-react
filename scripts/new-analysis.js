// Scaffold a new analysis .md with valid frontmatter — so the metadata contract
// never has to be typed by hand.
//
// Usage:
//   node scripts/new-analysis.js \
//     --title "Ather Energy — Deep Dive Analysis" \
//     --ticker "ATHERENERG" \
//     --tags "ev,auto,e2w" \
//     --summary "One-paragraph summary shown on cards and in link previews." \
//     [--slug ather-energy-deep-dive] [--date 2026-07-04] [--model deepseek-chat] \
//     [--body-file draft.md] [--force]
//
// The body may also be piped on stdin:  cat draft.md | node scripts/new-analysis.js ...
// If no body is provided, a titled placeholder is written.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const ANALYSES_DIR = path.join(REPO, 'public', 'analyses');

const { serializeFrontmatter } = await import(
  pathToFileURL(path.join(__dirname, 'lib', 'frontmatter.js')).href
);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function readStdin() {
  try {
    if (process.stdin.isTTY) return '';
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

const args = parseArgs(process.argv.slice(2));

const missing = ['title', 'ticker', 'tags', 'summary'].filter(
  (k) => typeof args[k] !== 'string' || !args[k].trim()
);
if (missing.length) {
  console.error(`✗ new-analysis: missing required flag(s): ${missing.map((m) => '--' + m).join(', ')}`);
  console.error('  Required: --title --ticker --tags --summary   (see header of this file for full usage)');
  process.exit(1);
}

const slug = (typeof args.slug === 'string' && args.slug.trim()) ? slugify(args.slug) : slugify(args.title);
const date = (typeof args.date === 'string' && args.date.trim()) ? args.date : today();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(`✗ new-analysis: --date must be YYYY-MM-DD (got "${date}")`);
  process.exit(1);
}

const tags = args.tags.split(',').map((t) => t.trim()).filter(Boolean);

let body = '';
if (typeof args['body-file'] === 'string') {
  body = fs.readFileSync(path.resolve(args['body-file']), 'utf8');
} else {
  body = readStdin();
}
if (!body.trim()) {
  body = `# ${args.title}\n\n_Draft — replace with the full analysis._\n`;
}

const frontmatter = serializeFrontmatter({
  title: args.title,
  ticker: args.ticker,
  date,
  tags,
  summary: args.summary,
  model: typeof args.model === 'string' ? args.model : 'deepseek-chat',
});

const outPath = path.join(ANALYSES_DIR, `${slug}.md`);
if (fs.existsSync(outPath) && !args.force) {
  console.error(`✗ new-analysis: ${path.relative(REPO, outPath)} already exists (pass --force to overwrite)`);
  process.exit(1);
}

fs.mkdirSync(ANALYSES_DIR, { recursive: true });
fs.writeFileSync(outPath, frontmatter + body.replace(/^\n+/, ''), 'utf8');

console.log(`✓ wrote ${path.relative(REPO, outPath)}`);
console.log(`  slug: ${slug}   date: ${date}`);
console.log('\nNext: node scripts/generate-analyses-data.js   (or npm run build)');
