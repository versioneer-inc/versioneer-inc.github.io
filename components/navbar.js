/**
 * Top navigation bar with links to different pages.
 */

customElements.define(
  "versioneer-navbar",
  class extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.css = `
            .fa-search path {
                transition: fill 0.3s ease;
                fill: #FFF7;
            }
            .fa-search path:hover {
                fill: #FFF;
            }
        `;
      this.content = `
        <section id="site-header" class="u-p-0">
            <div class="l-container">
                <div class="c-header">
                    <div class="c-brand">
                        <a href="/">
                            <h3 class="c-brand__title">
                                ${this.getAttribute("brand-title")}					
                            </h3>
                        </a>
                    </div>
                    <div class="c-header__navigation">
                        <nav class="c-nav">
                            <ul id="primary-menu" class="l-list l-list--inline">
                                ${this.menuItems
                                  .map(
                                    (item) => `
                                    <li class="menu-item menu-item-type-post_type menu-item-object-page ${
                                      window.location.pathname === item.href
                                        ? "current-menu-item"
                                        : ""
                                    } l-list__item"><a href="${
                                      item.href
                                    }" aria-current="page" class="c-nav-link">${
                                      item.title
                                    }</a></li>
                                `
                                  )
                                  .join("")}
                            </ul>
                        </nav>
                        <div class="c-header__icons">
                            <ul class="l-list l-list--inline u-display-flex u-align-items-center">
                                ${
                                  this.getAttribute("enable-search") !== null
                                    ? `
                                    <li class="l-list__item">
                                        <form class="c-search" role="search" method="get" action="/">
                                            <input class="c-search__field" type="search" placeholder="" value="" name="s" title="Search:" onfocus="searchfocus()">
                                            <button class="c-icon c-search__submit" type="submit">
                                                <svg class="svg-inline--fa fa-search fa-w-16" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="search" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
                                                    <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
                                                </svg>
                                            </button>
                                        </form>
                                    </li>
                                 `
                                    : ""
                                }
                                ${
                                  this.getAttribute("enable-login") !== null
                                    ? `
                                    <li class="l-list__item u-display-none u-display-md-block">
                                        <a class="c-button c-button--primary c-button--negative c-button--sm c-header__account" href="/login">
                                            <svg style="width: 1em" class="svg-inline--fa fa-sign-in fa-w-16" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sign-in" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
                                                <path fill="#003247" d="M137.2 110.3l21.9-21.9c9.3-9.3 24.5-9.4 33.9-.1L344.9 239c9.5 9.4 9.5 24.7 0 34.1L193 423.7c-9.4 9.3-24.5 9.3-33.9-.1l-21.9-21.9c-9.7-9.7-9.3-25.4.8-34.7l77.6-71.1H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h191.5l-77.6-71.1c-10-9.1-10.4-24.9-.7-34.5zM512 352V160c0-53-43-96-96-96h-84c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h84c17.7 0 32 14.3 32 32v192c0 17.7-14.3 32-32 32h-84c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h84c53 0 96-43 96-96z"></path>
                                            </svg>
                                            Sign In
                                        </a>
                                    </li>
                              `
                                    : ""
                                }
                                <li class="l-list__item u-display-md-none">
                                    <button id="menu-open" class="c-icon c-header__hamburger">
                                        <svg class="svg-inline--fa fa-bars fa-w-14" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bars" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
                                            <path fill="currentColor" d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
                                        </svg>
                                        <!-- <i class="fas fa-bars"></i> -->
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <!-- /.c-header__navigation -->
                </div>
                <!-- /.c-header -->
            </div>
            <!-- /.l-container -->
        </section>
    `;
      this.innerHTML = `
            <style>${this.css}</style>
            ${this.content}
        `;

      document.addEventListener("scroll", (e) => {
        let scrollTop = document.documentElement.scrollTop;
        let navbar = document.querySelector("#site-header");

        scrollTop > 250
          ? navbar.classList.add("is-gone")
          : navbar.classList.remove("is-gone");
        scrollTop > 500
          ? navbar.classList.add("is-sticky")
          : navbar.classList.remove("is-sticky");
      });

      // Open `versioneer-menu`
      this.querySelector("#menu-open").addEventListener("click", (e) => {
        document.querySelector(".c-menu").classList.add("is-open");
        document.body.classList.add("is-locked");
      });
    }
  }
);
