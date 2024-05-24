import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

(async () => {
  const handleFetch = async (ruc) => {
    const apiKey = "4bbd8b9f15fa19d04aca9bf0c5aa6c94";
    if (fs.existsSync("./plugin/js/config_ac_api_key.js")) {
      let confData = fs.readFileSync(
        "./plugin/js/config_ac_api_key.js",
        "utf8"
      );
      confData = confData.replace(
        /antiCapthaPredefinedApiKey = ''/g,
        `antiCapthaPredefinedApiKey = '${apiKey}'`
      );
      fs.writeFileSync("./plugin/js/config_ac_api_key.js", confData, "utf8");
    } else {
      console.error("plugin configuration not found!");
    }
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
      // headless: false,
      defaultViewport: null,
      ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"],
      args: [
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--allow-running-insecure-content",
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--mute-audio",
        "--no-zygote",
        "--no-xshm",
        "--window-size=1920,1080",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--enable-webgl",
        "--ignore-certificate-errors",
        "--lang=en-US,en;q=0.9",
        "--password-store=basic",
        "--disable-gpu-sandbox",
        "--disable-software-rasterizer",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-infobars",
        "--disable-breakpad",
        "--disable-canvas-aa",
        "--disable-2d-canvas-clip-aa",
        "--disable-gl-drawing-for-tests",
        "--enable-low-end-device-mode",
        "--disable-extensions-except=D:/Users/AGUSTIN/Desktop/Proyectos/ruc-scrapper/plugin",
        "--load-extension=D:/Users/AGUSTIN/Desktop/Proyectos/ruc-scrapper/plugin",
      ],
      executablePath:
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    });
    const [page] = await browser.pages();
    page.setDefaultNavigationTimeout(0);
    console.log("Ingresando a la pagina");
    await page.goto("https://srienlinea.sri.gob.ec/sri-en-linea/inicio/NAT", {
      waitUntil: "domcontentloaded",
    });

    const server = async () => {
      const rucButton = await page.waitForSelector(
        "#mySidebar > p-panelmenu > div > div:nth-child(2)"
      );
      console.log("Boton Ruc");
      await rucButton.click();
      const consultaButton = await rucButton.waitForSelector(
        "div.ui-panelmenu-content-wrapper.ng-trigger.ng-trigger-rootItem.ng-tns-c11-2.ng-star-inserted > div > p-panelmenusub > ul > li:nth-child(1) > a"
      );
      console.log("Boton Consulta");
      await consultaButton.evaluate((btn) => btn.click());
      console.log("Ingresando a la pagina de consultas");
      const input = await page.waitForSelector("input#busquedaRucId");
      await input.type(ruc);

      const button = await page
        .waitForSelector(
          "#sribody > sri-root > div > div.layout-main > div > div > sri-consulta-ruc-web-app > div > sri-ruta-ruc > div.row.ng-star-inserted > div.col-sm-12.ng-star-inserted > div:nth-child(7) > div.col-sm-6 > div > div:nth-child(2) > div"
        )
        .then((div) => div.waitForSelector("button:not([disabled])"));
      console.log("Haciendo la consulta");
      await button.click();
    };

    await server();
    return new Promise(async (resolve, reject) => {
      page
        .on("console", async (msg) => {
          if (msg.type() === "error") {
            try {
              console.log("Error");
              const homeButton = await page.$(
                "#sribody > sri-root > div > div.ng-star-inserted > sri-topbar > div > ul > li:nth-child(1) > a"
              );
              console.log("Volviendo a intentar");
              await homeButton.evaluate((btn) => btn.click());
              await server();
            } catch (error) {
              reject(error.message);
              await browser.close();
            }
          }
        })
        .on("response", async (res) => {
          if (
            res.url() ===
            `https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumerosRuc?&ruc=${ruc}`
          ) {
            const data = await res.json();
            resolve(data);
            await browser.close();
          }
        });
    });
  };
  let working = 1;
  // while (working) {
  try {
    const data = await handleFetch("0791779618001");
    console.log(data[0]);
    working = 0;
  } catch (error) {
    console.log(error);
  }
  // }
})();

// 0700291214001
// 0702142126001
// 0702537630001
// 0703391292001
// 0705205847001
// 0790084462001
// 0790102584001
// 0791722497001
// 0791737931001
// 0791744121001
// 0791758947001
// 0791779618001
// 0791798752001
