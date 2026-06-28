/**
 * A mobile menu replacing the navbar links if the space is too small to display them horizontally.
 */

customElements.define(
  "versioneer-menu",
  class extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.css = `
            #menu-close svg {
                width: 24px;
                height: 24px;
            }
        `;
      this.content = `

        `;
      this.innerHTML = `
            <style>${this.css}</style>
            <nav class="c-menu">
                <button id="menu-close" class="c-icon c-menu__close">
                    <svg class="svg-inline--fa fa-times fa-w-11" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512" data-fa-i2svg="">
                        <path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
                    </svg>
                    <!-- <i class="fas fa-times"></i> -->
                </button>
                <ul id="primary-menu" class="l-list">
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
                `,
                  )
                  .join("")}
                </ul>
            </nav>
        `;

      // Close `versioneer-menu`
      this.querySelector("#menu-close").addEventListener("click", (e) => {
        document.querySelector(".c-menu").classList.remove("is-open");
        document.body.classList.remove("is-locked");
      });
    }
  },
);
