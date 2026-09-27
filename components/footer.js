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
                    <div class="c-footer__layout ${
                      this.hasAttribute("logo-kit")
                        ? "c-footer__layout--with-logo"
                        : ""
                    }">
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
                        ${
                          this.hasAttribute("logo-kit")
                            ? `
                        <aside class="c-footer__logo" aria-label="Versioneer logo downloads">
                          <img
                            src="./logo_versioneer_green.svg"
                            alt="Versioneer — Meshing Earth Data"
                            loading="lazy"
                          >
                          <div class="c-footer__logo-links">
                            <a href="./logo_versioneer_green.png" download>PNG</a>
                            <a href="./logo_versioneer_green.svg" download>SVG</a>
                          </div>
                        </aside>
                        `
                            : ""
                        }
                    </div>
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
