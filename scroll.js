async function scroll(x, y, p, page) {
  return new Promise(async (resolve) => {
    await page.mouse.move(x, y);
    await page.mouse.wheel({ deltaY: p * 100 });
  });
}

module.exports = scroll;
