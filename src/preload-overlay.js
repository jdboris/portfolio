/**
 * A web component to hide the contents of the page until the window's "load" event, to prevent FOUC.
 */
class PreloadOverlay extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <slot></slot>
    `;

    const MINIMUM_TIME = 1200;
    (async () => {
      // Wait for both the 1-second timer AND the window load event
      await Promise.all([
        new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, MINIMUM_TIME);
        }),
        new Promise((resolve) => {
          window.addEventListener("load", () => {
            resolve();
          });
        }),
      ]);

      this.classList.add("hidden");
    })();
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

window.customElements.define("preload-overlay", PreloadOverlay);
