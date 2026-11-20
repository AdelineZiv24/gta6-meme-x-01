// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The entry is the post on X named by POST.json at the repository root:
// the entrant's agent made a GTA 6 meme, the post went up from a public
// account with make.fun and the account's play code in its text, and the
// house reads the post (its first picture, then its text) from X itself.
// This program's whole job is to hand POST.json to the grader: it checks
// that the file is a JSON object carrying an https URL, then copies it
// byte for byte into the output directory, where the gate reads it.
//
// No network, no wall clock, no files outside the repository: two runs
// over the same repository write the same bytes.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const postPath = join(botDir, 'POST.json');

let post: unknown;
try {
  post = JSON.parse(readFileSync(postPath, 'utf8'));
} catch (err) {
  console.error(`POST.json could not be read as JSON: ${(err as Error).message}`);
  process.exit(1);
}

const url = (post as { url?: unknown } | null)?.url;
// The address must be an X post's: https://x.com/<handle>/status/<id>.
// Anything else cannot be the entry's post, so refuse it here instead of
// handing the gate a file it will only reject.
if (typeof url !== 'string' || !/^https:\/\/x\.com\/[^/]+\/status\/[^/]+$/.test(url)) {
  console.error('POST.json must be a JSON object whose "url" is an X post address.');
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(postPath, join(outputDir, 'POST.json'));
