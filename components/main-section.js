/**
 * Versioneer-branded cover section with background image.
 */

customElements.define(
  "versioneer-main-section",
  class extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.css = ``;
      this.content = ``;
      this.innerHTML = `
        <style>${this.css}</style>
        <section>
          <div class="l-container">
            <div class="l-row">
              ${
                this.hasAttribute("title")
                  ? `
                  <div class="l-col-12 l-col-sm-8 l-offset-sm-1 l-col-md-4">
                    <h2 class="u-mb-3 u-mb-md-0">
                      ${this.getAttribute("title")}
                    </h2>
                  </div>
                  <!-- /.l-col -->
                  <div class="l-col-12 l-col-sm-8 l-offset-sm-1 l-col-md-5">
                    <p class="u-f-lg u-m-0">
                      ${this.getAttribute("text")}
                    </p>
                  </div>
                  <!-- /.l-col -->
                `
                  : `
                  <div class="l-col-12 l-col-sm-8 l-offset-sm-1 l-col-md-7 l-col-lg-5 l-offset-lg-2">
                    <p class="u-f-lg u-m-0">
                      ${this.getAttribute("text")}
                    </p>
                  </div>
                  <!-- /.l-col -->
                `
              }
            </div>
            <!-- /.l-row -->
          </div>
          <!-- /.l-container -->
        </section>
        `;
    }
  }
);
