const puppeteer = require("puppeteer");
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

(async () => {
  const url = process.argv[2]; // Pass the URL as a command-line argument

  if (!url) {
    console.log("Please provide a URL as an argument.");
    process.exit(1);
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the viewport size
    await page.setViewport({ width: 1280, height: 720 });

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2" });

    console.log("Switching to ATC view...");
    await page.click(".geofs-map-atc-button.geofs-hideForApp", { count: 1 });
    await sleep(3500);

    // Define the area to zoom in on
    /* const clip = {
      x: 100, // Horizontal offset (in pixels)
      y: 200, // Vertical offset (in pixels)
      width: 800, // Width of the area (in pixels)
      height: 400, // Height of the area (in pixels)
    }; */

    // Take a screenshot of the specified area
    const fileName = `${process.cwd()}/Output/screenshot-zoomed.png`;
    await page.screenshot({ path: fileName /* , clip */ });
    console.log(`Zoomed-in screenshot saved as ${fileName}`);

    await browser.close();
  } catch (error) {
    console.error(`Error taking screenshot: ${error.message}`);
  }
})();
