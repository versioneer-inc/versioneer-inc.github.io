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
                            <img
                                class="c-brand__logo"
                                src="./logo_versioneer_green.png"
                                alt="Versioneer"
                            >
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

      const updateNavbar = () => {
        let scrollTop = document.documentElement.scrollTop;
        let navbar = document.querySelector("#site-header");

        scrollTop > 250
          ? navbar.classList.add("is-gone")
          : navbar.classList.remove("is-gone");
        scrollTop > 500
          ? navbar.classList.add("is-sticky")
          : navbar.classList.remove("is-sticky");
      };

      updateNavbar();
      document.addEventListener("scroll", updateNavbar);

      // Open `versioneer-menu`
      this.querySelector("#menu-open").addEventListener("click", (e) => {
        document.querySelector(".c-menu").classList.add("is-open");
        document.body.classList.add("is-locked");
      });
    }
  }
);
