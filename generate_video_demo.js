const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function recordPrototypeVideo() {
  console.log('Starting Playwright automated presentation walkthrough...');
  
  const videoDir = path.join(__dirname, 'video_recordings');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // --- Step 1: Executive Dashboard Walkthrough ---
  console.log('Step 1: Executive Dashboard Overview');
  await page.waitForTimeout(2000);
  
  // Scroll down smoothly to show forecast chart
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(2500);

  // Scroll down to 6-month table
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2500);

  // Scroll back top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  // --- Step 2: Indicator Lead-Lag & Causality Matrix ---
  console.log('Step 2: Indicator Lead-Lag Matrix');
  await page.click('button:has-text("Indicator Lead-Lag")');
  await page.waitForTimeout(2000);

  // Interact with correlation lag slider
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
  
  // Switch to Aluminium Drivers tab
  await page.click('button:has-text("LME Aluminium Drivers")');
  await page.waitForTimeout(2500);

  // --- Step 3: AI Model Engine & SHAP Explainability ---
  console.log('Step 3: AI Model & SHAP Feature Importance');
  await page.scrollToTop && await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.click('button:has-text("AI Model & SHAP")');
  await page.waitForTimeout(2000);

  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await page.waitForTimeout(2500);

  // --- Step 4: Walk-Forward Backtest Suite ---
  console.log('Step 4: Out-of-Sample Walk-Forward Backtest');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.click('button:has-text("Walk-Forward Backtest")');
  await page.waitForTimeout(2000);

  // Switch horizon buttons to show user metrics
  await page.click('button:has-text("2-Month Horizon")');
  await page.waitForTimeout(2000);

  await page.click('button:has-text("3-Month Horizon")');
  await page.waitForTimeout(2000);

  await page.click('button:has-text("1-Month Horizon")');
  await page.waitForTimeout(2000);

  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(2500);

  // --- Step 5: Smart Procurement & BoM Decision Simulator ---
  console.log('Step 5: Smart Procurement & BoM Simulator');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.click('button:has-text("Smart Procurement & BoM")');
  await page.waitForTimeout(2000);

  // Fill in sample inputs to trigger dynamic decision recalculation
  await page.fill('input[type="number"] >> nth=0', '750');
  await page.waitForTimeout(1000);
  await page.fill('input[type="number"] >> nth=1', '1050');
  await page.waitForTimeout(2000);

  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await page.waitForTimeout(2500);

  console.log('Walkthrough presentation complete. Closing context...');
  const videoFile = await page.video().path();
  await context.close();
  await browser.close();

  console.log(`Raw video saved at: ${videoFile}`);

  // Convert WebM to MP4 and copy to brain artifact directory
  const artifactDir = '/Users/sanvijain/.gemini/antigravity-ide/brain/ee125f67-b9c3-4158-b19f-cd76dd12424d';
  const targetMp4 = path.join(artifactDir, 'prototype_demo.mp4');
  const targetWebm = path.join(artifactDir, 'prototype_demo.webm');

  fs.copyFileSync(videoFile, targetWebm);
  console.log(`Copied raw WebM to ${targetWebm}`);

  try {
    console.log('Converting video to MP4 using FFmpeg...');
    execSync(`ffmpeg -y -i "${videoFile}" -c:v libx264 -pix_fmt yuv420p "${targetMp4}"`);
    console.log(`Successfully generated MP4 presentation video at: ${targetMp4}`);
  } catch (err) {
    console.error('Error during FFmpeg conversion:', err.message);
  }
}

recordPrototypeVideo().catch(err => {
  console.error('Failed to record video:', err);
  process.exit(1);
});
