/**
 * Versioneer-branded top navigation bar with wordmark and logo.
 */

customElements.define(
  "versioneer-header",
  class extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.css = `
        versioneer-header {
          position: absolute;
          top: 0;
          width: 100%;
        }
      `;
      this.content = ``;
      this.innerHTML = `
            <style>${this.css}</style>
            <section id="versioneer-header" class="versioneer-header">
                <div class="versioneer-header__left">
                    <img class="versioneer-header__title" src="./versioneer_logo.png" alt="Versioneer">
                </div>
            </section>
        `;
    }
  }
);
