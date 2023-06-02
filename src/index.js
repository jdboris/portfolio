import "@jdboris/css-themes/vs-code";
import { setRoot } from "spa-routing";
import "@fortawesome/fontawesome-free/css/all.css";
import "./style.scss";

setRoot(process.env.APP_PATH || "/");

const NAV_SIZE_BREAKPOINT = 645;
let previousWidth = null;

new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    if (
      entry.contentRect.width <= NAV_SIZE_BREAKPOINT &&
      (previousWidth > NAV_SIZE_BREAKPOINT || previousWidth === null)
    ) {
      document
        .querySelectorAll("body > main > nav > details[open]")
        .forEach((x) => (x.open = false));
    }
    previousWidth = entry.contentRect.width;
  });
}).observe(document.body);
