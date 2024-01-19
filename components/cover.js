/**
 * Versioneer-branded cover section with background image.
 */

customElements.define(
  "versioneer-cover",
  class extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.css = ``;
      this.content = ``;
      this.innerHTML = `
        <style>${this.css}</style>
        <section id="cover" class="c-cover c-cover--image">
          <div class="l-container u-z-1">
            <div class="l-row">
              <div class="l-col-12 l-col-sm-8 l-offset-sm-1 l-col-md-6 l-col-lg-5 l-offset-lg-2 l-col-xl-4">
                <p class="t-overline">
                  ${this.getAttribute("overline")}
                </p>
                <h1 class="c-cover__title">
                ${this.getAttribute("title")}
                </h1>
              </div>
              <!-- /.l-col -->
            </div>
            <!-- /.l-row -->
          </div>
          <!-- /.l-container -->
          <figure class="c-background-image c-cover__background u-z-0">
            <div class="c-dimmer c-cover__dimmer c-cover__dimmer--nav"></div>
            <div class="c-dimmer c-cover__dimmer"></div>
            <img src="${this.getAttribute(
              "background-image"
            )}" width="1500" height="1000" alt="" srcset="./../connected-earth.png" sizes="(max-width: 1500px) 100vw, 1500px">
          </figure>
        </section>
        `;
    }
  }
);
