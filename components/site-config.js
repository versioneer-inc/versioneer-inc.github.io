(function () {
  const footer = {
    title: "Ready to build your domain data platform?",
    description:
      'We work with organizations that need domain-specific data platforms, trusted data products, cloud infrastructure, and hands-on engineering support.<br/><br/>We take operational burden from your data stewards and domain facilitators so they can stay close to end users while the control plane runs in your cloud.<br/><br/>Former <a href="https://www.sciencepark.at/de/p/versioneer/">ESA BIC incubatee</a> via Science Park Graz.',
  };

  const footerItems = [
    [
      {
        href: "https://research.versioneer.at",
        title: "Research",
      },
      {
        href: "https://github.com/versioneer-tech/",
        title: "Open Source",
      },
      {
        href: "blog.html",
        title: "Blog",
      },
    ],
    [
      {
        href: "about-terms-1.0.pdf",
        title: "About & Terms",
      },
      {
        href: "privacy-notice-1.0.pdf",
        title: "Privacy Notice",
      },
      {
        href: "terms-conditions-1.0.pdf",
        title: "Terms & Conditions",
      },
      {
        href: "disclaimer-1.0.pdf",
        title: "Disclaimer",
      },
    ],
  ];

  function createMenuItems(baseHref = "") {
    return [
      {
        href: `${baseHref}#building-blocks`,
        title: "How We Facilitate",
      },
      {
        href: `${baseHref}#datalab`,
        title: "DataLab Foundation",
      },
      {
        href: `${baseHref}#private-saas`,
        title: "Our Offering",
      },
      {
        href: `${baseHref}#architecture`,
        title: "Capability Map",
      },
    ];
  }

  function applyVersioneerSiteConfig({ menuBase = "" } = {}) {
    const menuItems = createMenuItems(menuBase);
    const navbar = document.querySelector("versioneer-navbar");
    const menu = document.querySelector("versioneer-menu");
    const footerElement = document.querySelector("versioneer-footer");

    if (navbar) {
      navbar.menuItems = menuItems;
    }

    if (menu) {
      menu.menuItems = menuItems;
    }

    if (footerElement) {
      footerElement.footerItems = footerItems;
      footerElement.setAttribute("title", footer.title);
      footerElement.setAttribute("description", footer.description);
    }
  }

  window.versioneerSiteConfig = {
    createMenuItems,
    footer,
    footerItems,
  };
  window.applyVersioneerSiteConfig = applyVersioneerSiteConfig;
})();
