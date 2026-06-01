import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
await mkdir('/tmp/gemini', { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const snap = async (url, file, full=false) => {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `/tmp/gemini/${file}`, fullPage: full });
};

await snap('http://localhost:3000/', 'home.png');
await snap('http://localhost:3000/recipes', 'recipes.png');
await snap('http://localhost:3000/planner', 'planner.png');

// Try to navigate to a recipe detail
await page.goto('http://localhost:3000/recipes', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const recipeLink = await page.locator('a[href*="/recipes/"]').first().getAttribute('href');
if (recipeLink) {
  await snap('http://localhost:3000' + recipeLink, 'recipe_detail.png', true);
}

// Desktop view too
const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5 });
const page2 = await ctx2.newPage();
await page2.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page2.waitForTimeout(1000);
await page2.screenshot({ path: '/tmp/gemini/home_desktop.png' });
await page2.goto('http://localhost:3000/recipes', { waitUntil: 'networkidle' });
await page2.waitForTimeout(800);
await page2.screenshot({ path: '/tmp/gemini/recipes_desktop.png' });

await browser.close();
console.log('Done');
