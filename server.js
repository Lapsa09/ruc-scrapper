import { launch } from "puppeteer";

(async () => {
  const handleFetch = async (ruc) => {
    const browser = await launch({
      // headless: false,
      // defaultViewport: null,
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
  while (working) {
    try {
      const data = await handleFetch("1303185639001");
      console.log(data[0]);
      working = 0;
    } catch (error) {
      console.log(error);
    }
  }
})();
