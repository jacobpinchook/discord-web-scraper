// UNUSED IN CURRENT IMPLEMENTATION
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://lostenterprises.com/new-arrivals/", {
    waitUntil: "networkidle2",
  });

  //   await page.pdf({ path: "lost-new-arrivals.pdf", format: "A4" });

  //   const items = await page.evaluate(() =>
  //     Array.from(document.querySelectorAll(".product-small"), (e) => ({
  //       title: e.querySelector(".box-text .title-wrapper a").innerText,
  //       price: e.querySelector(".box-text .price-wrapper bdi").innerText,
  //       url: e.querySelector(".box-text .title-wrapper a").href,
  //       photo: e.querySelector(".box-image a img").getAttribute("data-src"),
  //     }))
  //   );

  const products = await page.$$eval(".product-small", (elements) =>
    elements.map((e) => ({
      title: e.querySelector(".box-text .title-wrapper a").innerText,
      price: e.querySelector(".box-text .price-wrapper bdi").innerText,
      url: e.querySelector(".box-text .title-wrapper a").href,
      photo: e.querySelector(".box-image a img").getAttribute("data-src"),
    }))
  );

  //   console.log(products);

  // Save data to JSON file
  fs.writeFile("products.json", JSON.stringify(products), (err) => {
    if (err) throw err;
    console.log("File saved");
  });

  await browser.close();
})();
