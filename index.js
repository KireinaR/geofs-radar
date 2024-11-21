const puppeteer = require("puppeteer");

const scroll = require("./scroll");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function getOffset(lat, long) {
  let x = 720 / 2 + 720 / (360 / long);
  let y = 1080 / 2 - 1080 / (180 / lat);
  return { x: Math.round(x) + 12, y: Math.round(y) + 25 };
}

function realWorldToPixelCoordinates(latitude, longitude, mapWidth, mapHeight) {
  if (longitude < -180 || longitude > 180) {
    throw new Error("Longitude must be between -180 and 180.");
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error("Latitude must be between -90 and 90.");
  }

  // Longitude to x-coordinate
  const x = ((longitude + 180) / 360) * mapWidth;

  // Latitude to y-coordinate (inverted for map representation)
  const y = ((90 - latitude) / 180) * mapHeight;
  console.log("done");
  return { x: Math.round(x), y: Math.round(y) };
}

(async () => {
  /* const url = process.argv[2]; */ // Pass the URL as a command-line argument
  const url = "https://www.geo-fs.com/pages/map.php";

  if (!url) {
    console.log("Please provide a URL as an argument.");
    process.exit(1);
  }

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log(`Opening Radar`);
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.setRequestInterception(true);

    await sleep(2000);

    console.log("Switching to ATC view...");
    await page.click(".geofs-map-atc-button.geofs-hideForApp", { count: 1 });
    await sleep(2000);

    //await page.waitForNetworkIdle();

    let x = process.argv[2],
      y = process.argv[3];

    // Define the area to zoom in on
    /*     const clip = {
      x: c.x, // Horizontal offset (in pixels)
      y: c.y, // Vertical offset (in pixels)
      width: 400, // Width of the area (in pixels)
      height: 200, // Height of the area (in pixels)
    }; */

    let zoomLevel = Number(process.argv[4]);

    await page.setViewport({
      width: 1280,
      height: 720,
      /* deviceScaleFactor: zoomLevel, */
    });

    //let pixel = getOffset(x, y);
    let pixel = getOffset(x, y);
    console.log(pixel);

    page.on("request", (req) => {
      if (req.resourceType() === "font") req.abort();
      else req.continue();
    });

    /*     await page.evaluate(
      ({ x, y, zoom }) => {
        document.body.style.transformOrigin = `${x}px ${y}px`; // Set zoom origin
        document.body.style.transform = `scale(${zoom})`; // Apply zoom
        window.scrollTo(x - window.innerWidth / 2, y - window.innerHeight / 2); // Center pixel
      },
      { x: pixel.x, y: pixel.y, zoom: zoomLevel }
    ); */

    await page.mouse.move(82, 170);
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel({
        deltaX: 0,
        deltaY: -500,
      });
    }

    console.log("Zoom");
    await sleep(15000);

    // Take a screenshot of the specified area
    const fileName = `${process.cwd()}/Output/screenshot-zoomed.png`;
    await page.screenshot({ path: fileName /* , clip */ });
    console.log(`Zoomed-in screenshot saved as ${fileName}`);

    await browser.close();
  } catch (error) {
    console.error(`Error taking screenshot:\n${error.message}`);
    console.error(error.stack);
  }
})();
