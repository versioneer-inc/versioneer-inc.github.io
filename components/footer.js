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
                    <div class="c-footer u-py-5 u-py-sm-6">
                    <div class="c-footer__layout">
                        <div class="c-footer__contact">
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
                        <div class="c-footer__navigation">
                        <nav class="c-nav u-mr-0 u-display-block">
                            <div class="c-footer__links">
                                ${this.footerItems
                                  .map((div) => {
                                    return `
                                        <div>
                                            <ul class="l-list">
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
                                    `;
                                  })
                                  .join("")}
                            </div>
                        </nav>
                        </div>
                    </div>
                    </div>
                    <!-- /.c-footer -->
                    <div class="c-footer__meta u-f-sm u-mt-4">
                      <p class="u-mb-0">Versioneer © ${new Date().getFullYear()}</p>
                      ${
                        this.hasAttribute("logo-kit")
                          ? `
                      <nav class="c-footer__logo-downloads" aria-label="Versioneer media kit downloads">
                        <span>Media Kit:</span>
                        <span class="c-footer__logo-group">
                          <span>White Logo</span>
                          <a href="./logo_versioneer_white.png" download>PNG</a>
                          <span aria-hidden="true">|</span>
                          <a href="./logo_versioneer_white.svg" download>SVG</a>
                        </span>
                        <span class="c-footer__logo-group">
                          <span>Green Logo</span>
                          <a href="./logo_versioneer_green.png" download>PNG</a>
                          <span aria-hidden="true">|</span>
                          <a href="./logo_versioneer_green.svg" download>SVG</a>
                        </span>
                      </nav>
                      `
                          : ""
                      }
                    </div>
                </div>
                <!-- /.l-container -->
                </section>
        `;
    }
  },
);
