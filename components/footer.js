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
                margin-top: 256px;
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
                    <div class="l-row">
                        <div class="l-col-12 l-col-sm-6 l-col-md-4 l-col-lg-3">
                        <h3 class="u-mb-2">
                            ${this.getAttribute("title")}					
                        </h3>
                        <p class="u-f-sm">
                        ${this.getAttribute("description")}
                        </p>
                        <a class="c-button c-button--primary u-mt-1" href="/contact-us">
                        Contact us					</a>
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
                                                `
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
  }
);
