/**
 * Versioneer-branded top navigation bar with wordmark and logo.
 */

customElements.define(
  "versioneer-footer",
  class extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.css = `
            #site-footer {
                margin-top: 2px;
            }
        `;
      this.content = `
            Header ${
              this.getAttribute("enable-search") !== null
                ? "with search enabled!"
                : ""
            }
            ${
              this.getAttribute("enable-menu") !== null
                ? "with menu enabled!"
                : ""
            }
        `;
      this.innerHTML = `
            <style>${this.css}</style>
            <section id="site-footer">
                <div class="l-container">
                    ${
                      this.hasAttribute("logo-kit")
                        ? `
                    <div class="logo-kit" aria-labelledby="logo-kit-title">
                      <div class="logo-kit__header">
                        <p class="t-overline">Brand assets</p>
                        <h2 id="logo-kit-title">Versioneer logo kit</h2>
                        <p>
                          Two full wordmarks with the “Meshing Earth Data” line.
                          Choose the treatment that gives the best contrast.
                        </p>
                      </div>
                      <div class="logo-kit__grid">
                        <article class="logo-kit-card">
                          <img
                            class="logo-kit-card__preview"
                            src="./logo_versioneer_green.svg"
                            alt="Light Versioneer wordmark on a dark green background"
                            loading="lazy"
                          >
                          <div class="logo-kit-card__body">
                            <h3>Dark background</h3>
                            <div class="logo-kit-card__downloads">
                              <a href="./logo_versioneer_green.png" download>PNG</a>
                              <a href="./logo_versioneer_green.svg" download>SVG</a>
                            </div>
                          </div>
                        </article>
                        <article class="logo-kit-card">
                          <img
                            class="logo-kit-card__preview"
                            src="./logo_versioneer_white.svg"
                            alt="Green Versioneer wordmark on a white background"
                            loading="lazy"
                          >
                          <div class="logo-kit-card__body">
                            <h3>Light background</h3>
                            <div class="logo-kit-card__downloads">
                              <a href="./logo_versioneer_white.png" download>PNG</a>
                              <a href="./logo_versioneer_white.svg" download>SVG</a>
                            </div>
                          </div>
                        </article>
                      </div>
                    </div>
                    `
                        : ""
                    }
                    <div class="c-footer u-py-5 u-py-sm-6">
                    <div class="l-row">
                        <div class="l-col-12 l-col-sm-6 l-col-md-4 l-col-lg-3">
                          <h3 class="u-mb-2">
                            ${this.getAttribute("title")}
                          </h3>
                          <p class="u-f-sm">
                            ${this.getAttribute("description")}
                          </p>
                          <a class="c-button c-button--primary u-mt-1" href="mailto:info@versioneer.at">
                            Contact us
                          </a>
                        </div>
                        <!-- /.l-col -->
                        <div class="l-col-12 l-col-sm-4 l-offset-sm-2 l-col-md-7 l-offset-md-1 l-col-lg-6 l-offset-lg-2">
                        <nav class="c-nav u-mr-0 u-display-block">
                            <div class="l-row">
                                ${this.footerItems
                                  .map((div) => {
                                    return `
                                        <div class="l-col-12 l-col-md-4">
                                            <ul class="l-list u-mt-5 u-mt-sm-0">
                                                ${div
                                                  .map(
                                                    (li) => `
                                                    <li class="l-list__item">
                                                        <a class="c-nav__link" href="${li.href}">
                                                            ${li.title}
                                                        </a>
                                                    </li>
                                                `,
                                                  )
                                                  .join("")}
                                            </ul>
                                        </div>
                                        <!-- /.l-col -->
                                    `;
                                  })
                                  .join("")}
                            </div>
                            <!-- /.l-row -->
                        </nav>
                        </div>
                        <!-- /.l-col -->
                    </div>
                    <!-- /.l-row -->
                    </div>
                    <!-- /.c-footer -->
                    <p class="u-f-sm u-mt-4 u-mb-0">Versioneer © ${new Date().getFullYear()}</p>
                </div>
                <!-- /.l-container -->
                </section>
        `;
    }
  },
);
