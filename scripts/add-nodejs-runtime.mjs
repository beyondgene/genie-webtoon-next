// scripts/add-nodejs-runtime.mjs
import { globby } from 'globby';
import fs from 'fs/promises';

const files = await globby(['app/api/**/route.{ts,tsx,js,mjs,cjs}']);
let changed = 0;

for (const file of files) {
  let txt = await fs.readFile(file, 'utf8');
  if (!/export\s+const\s+runtime\s*=/.test(txt)) {
    txt = `export const runtime = 'nodejs';\n` + txt;
    await fs.writeFile(file, txt, 'utf8');
    changed++;
    console.log('updated:', file);
  }
}
console.log('done. changed:', changed);
