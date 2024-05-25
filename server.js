import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import "dotenv/config";

(async () => {
  const handleFetch = async (ruc) => {
    const apiKey = process.env.ANTICAPTCHA_API_KEY;
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
      defaultViewport: null,
      ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"],
      args: [
        `--disable-extensions-except=${process.env.PLUGIN_LOCATION}`,
        `--load-extension=${process.env.PLUGIN_LOCATION}`,
      ],
    });
    const page = await browser.newPage();
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
    page.on("console", async (msg) => {
      console.log(msg);
      if (msg.type() === "error") {
        console.log("Error");
        const homeButton = await page.$(
          "#sribody > sri-root > div > div.ng-star-inserted > sri-topbar > div > ul > li:nth-child(1) > a"
        );
        await homeButton.evaluate((btn) => btn.click());

        await server();
      }
    });

    const res = await page.waitForResponse(
      `https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumerosRuc?&ruc=${ruc}`,
      {
        timeout: 15000,
      }
    );
    const data = await res.json();
    await browser.close();
    return data;
  };
  try {
    const data = await handleFetch("0791758947001");
    console.log(data[0]);
  } catch (error) {
    console.log(error);
  }
})();
