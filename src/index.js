import "@jdboris/css-themes/vs-code";
import { setRoot } from "spa-routing";
import "@fortawesome/fontawesome-free/css/all.css";
import "./style.scss";

setRoot(process.env.APP_PATH || "/");

const NAV_SIZE_BREAKPOINT = 645;
let width = null;

const sideNav = document.querySelector("body > main > nav");

// Collapse sidenav if page is too small on load or on resize
new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    if (
      entry.contentRect.width <= NAV_SIZE_BREAKPOINT &&
      (width > NAV_SIZE_BREAKPOINT || width === null)
    ) {
      sideNav
        .querySelectorAll(":scope > details[open]")
        .forEach((x) => (x.open = false));
    }
    width = entry.contentRect.width;
  });
}).observe(document.body);

window.addEventListener("popstate", () => {
  // "Activate" and "deactivate" appropriate links
  sideNav
    .querySelectorAll(`a:not([href="${location.pathname}"])`)
    .forEach((x) => x.classList.remove("active"));

  sideNav.querySelectorAll(`a[href="${location.pathname}"]`).forEach((x) => {
    x.classList.add("active");

    // Expand all ancestor "folders"
    for (
      let folder = x.closest("details");
      folder !== null;
      folder = folder.parentElement.closest("details")
    ) {
      folder.open = true;
    }
  });
});
