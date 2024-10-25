import "@jdboris/css-themes/vs-code";
import { setRoot } from "spa-routing";
import "@fortawesome/fontawesome-free/css/all.css";
import "./style.scss";
import debounce from "./debounce.js";
import { search, selectMatch } from "./search.js";
import html from "https://cdn.jsdelivr.net/gh/jdboris/htmljs@latest/html.js";
import pdfjs from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.7.107/+esm";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

setRoot(process.env.APP_PATH || "/");

const NAV_SIZE_BREAKPOINT = 645;
const SPLIT_MODE_BREAKPOINT = 900;
let width = null;

const sideNav = document.querySelector("body > main > nav");

// Close all other sidenav togglers when opening one
sideNav.querySelectorAll(":scope > details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (details.open) {
      sideNav.querySelectorAll(":scope > details").forEach((other) => {
        if (other != details) {
          other.open = false;
        }
      });
    }
  });
});

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

    if (
      entry.contentRect.width <= SPLIT_MODE_BREAKPOINT &&
      (width > SPLIT_MODE_BREAKPOINT || width === null)
    ) {
      // Hide all routes that start with /work except for the last one
      const routes = [
        ...document.querySelectorAll("spa-route[path^='/work'][active]"),
      ];
      routes.pop();
      routes.forEach((x) => (x.active = false));
    }

    if (
      entry.contentRect.width > SPLIT_MODE_BREAKPOINT &&
      (width <= SPLIT_MODE_BREAKPOINT || width === null)
    ) {
      if (document.querySelector("spa-route[path^='/work'][active]")) {
        document
          .querySelectorAll(`spa-route[path="${process.env.APP_PATH}/work"]`)
          .forEach((x) => (x.active = true));
      }
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

    // Close on navigate if on small screen
    if (width <= NAV_SIZE_BREAKPOINT) {
      sideNav
        .querySelectorAll(":scope > details[open]")
        .forEach((x) => (x.open = false));
    }
  });

  if (width > SPLIT_MODE_BREAKPOINT) {
    if (location.pathname.startsWith(`${process.env.APP_PATH}/work`)) {
      document
        .querySelectorAll(`spa-route[path="${process.env.APP_PATH}/work"]`)
        .forEach((x) => (x.active = true));
    }
  }
});

// SEARCH TAB
{
  const form = document.querySelector("#search-form");
  const textbox = form.querySelector("[type='search']");
  textbox.addEventListener("input", (e) => form.requestSubmit());
  textbox.addEventListener("change", (e) => form.requestSubmit());

  document.querySelector("#search-tab").addEventListener("toggle", (e) => {
    if (e.currentTarget.open) {
      textbox.focus();
    }
  });

  let id = null;
  form.onsubmit = (e) => {
    e.preventDefault();
    id = debounce(id, () => {
      const searchResultsSection = document.querySelector(
        "#search-results-section"
      );
      const matches = search(textbox.value);

      if (!matches.length) {
        searchResultsSection.innerHTML = "<span>No results found.</span>";

        return;
      }

      const matchesByRoute = matches.reduce((total, match) => {
        const route = match.node.parentElement.closest(
          `spa-route:not([path="${process.env.APP_PATH}"])`
        );
        // Ignore search results that aren't in a route.
        if (!route) return total;

        return {
          ...total,
          [route.path]: [...(total[route.path] || []), match],
        };
      }, {});

      searchResultsSection.innerHTML = "";

      // Render a list of <details> containing <navs> with links to show the search results.
      searchResultsSection.append(
        ...Object.entries(matchesByRoute).map(([path, matches]) => {
          return SearchResult(path, matches);
        })
      );
    });
  };

  function SearchResult(path, matches) {
    const file = path.split("/").at(-1);
    return html`
      <details open>
        <summary>${file}</summary>
        <nav>
          ${matches.map(
            (match) => html`
              <a
                ${{
                  href: path,
                  onclick(e) {
                    selectMatch(match);
                  },
                }}
              >
                <span>
                  ${match.input.substring(
                    match.index - 5,
                    match.index
                  )}<mark>${match[0]}</mark>${match.input.substring(
                    match.index + match[0].length,
                    match.index + match[0].length + 30
                  )}
                </span>
              </a>
            `
          )}
        </nav>
      </details>
    `;
  }
}

//
// Asynchronous download PDF
//
const loadingTask = pdfjs.getDocument(
  "https://jdboris.github.io/resume/resume.pdf"
);
(async () => {
  const pdf = await loadingTask.promise;
  //
  // Fetch the first page
  //
  const page = await pdf.getPage(1);
  const scale = 1.5;
  const viewport = page.getViewport({ scale });
  // Support HiDPI-screens.
  const outputScale = window.devicePixelRatio || 1;

  //
  // Prepare canvas using PDF page dimensions
  //
  const canvas = document.querySelector(
    `[path="${process.env.APP_PATH}/resume"] canvas`
  );
  const context = canvas.getContext("2d");

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = Math.floor(viewport.width) + "px";
  canvas.style.height = Math.floor(viewport.height) + "px";

  const transform =
    outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

  //
  // Render PDF page into canvas context
  //
  const renderContext = {
    canvasContext: context,
    transform,
    viewport,
  };
  page.render(renderContext);
})();
