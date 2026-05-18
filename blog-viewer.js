const POSTS = [
  {
    key: "2026-05-19-from-object-uploads-to-product-transactions-in-eo-data",
    date: "2026-05-19",
    file: "blog/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data.md",
    fallbackTitle: "From Object Uploads to Product Transactions in EO Data",
  },
  {
    key: "2026-05-17-from-lego-bricks-to-composable-governance-why-agentic-data-platforms-need-a-resource-model-8871e7b1f036",
    date: "2026-05-17",
    file: "blog/2026-05-17-from-lego-bricks-to-composable-governance-why-agentic-data-platforms-need-a-resource-model-8871e7b1f036.md",
    fallbackTitle:
      "From Lego Bricks to Composable Governance: Why Agentic Data Platforms Need a Resource Model",
  },
  {
    key: "2026-01-28-earth-observation-has-a-processing-problem-but-not-the-one-we-think-5deefe3ae47e",
    date: "2026-01-28",
    file: "blog/2026-01-28-earth-observation-has-a-processing-problem-but-not-the-one-we-think-5deefe3ae47e.md",
    fallbackTitle: "Earth Observation Has a Processing Problem-But Not the One We Think",
  },
  {
    key: "2025-10-31-the-cost-of-redundancy-522874a985da",
    date: "2025-10-31",
    file: "blog/2025-10-31-the-cost-of-redundancy-522874a985da.md",
    fallbackTitle: "The Cost of Redundancy",
  },
  {
    key: "2025-10-31-towards-a-pragmatic-storage-ecosystem-for-earth-sciences-71f9bbeda5b8",
    date: "2025-10-31",
    file: "blog/2025-10-31-towards-a-pragmatic-storage-ecosystem-for-earth-sciences-71f9bbeda5b8.md",
    fallbackTitle: "Towards a Pragmatic Storage Ecosystem for Earth Sciences",
  },
  {
    key: "2025-10-01-building-data-supply-chains-with-lego-bricks-why-earth-observation-needs-composable-infrastructure-38600b920bb6",
    date: "2025-10-01",
    file: "blog/2025-10-01-building-data-supply-chains-with-lego-bricks-why-earth-observation-needs-composable-infrastructure-38600b920bb6.md",
    fallbackTitle:
      "Building Data Supply Chains with Lego Bricks: Why Earth Observation Needs Composable Infrastructure",
  },
  {
    key: "2025-07-16-standardizing-the-eo-data-supply-chain-enabling-reproducible-data-collaboration-at-scale-78c83fe81c3d",
    date: "2025-07-16",
    file: "blog/2025-07-16-standardizing-the-eo-data-supply-chain-enabling-reproducible-data-collaboration-at-scale-78c83fe81c3d.md",
    fallbackTitle:
      "Standardizing the EO Data Supply Chain: Enabling Reproducible Data Collaboration at Scale",
  },
  {
    key: "2025-05-19-stop-shipping-raw-files-start-shipping-data-packages-ce5aa3fe0a5c",
    date: "2025-05-19",
    file: "blog/2025-05-19-stop-shipping-raw-files-start-shipping-data-packages-ce5aa3fe0a5c.md",
    fallbackTitle: "Stop shipping raw files. Start shipping data packages.",
  },
  {
    key: "2025-01-26-data-governance-rot",
    date: "2025-01-26",
    file: "blog/2025-01-26-data-governance-rot.md",
    fallbackTitle: "A Governance Strategy to Minimize ROT Data",
  },
  {
    key: "2024-12-30-rot-all-levels",
    date: "2024-12-30",
    file: "blog/2024-12-30-rot-all-levels.md",
    fallbackTitle: "Minimize ROT Data on All Levels",
  },
  {
    key: "2024-12-27-app-aware-rot",
    date: "2024-12-27",
    file: "blog/2024-12-27-app-aware-rot.md",
    fallbackTitle: "Application-Aware ROT Data Minimizing",
  },
  {
    key: "2024-11-12-earth-data-sharing-at-reasonable-scale-with-open-source-tools-4ccea43679e6",
    date: "2024-11-12",
    file: "blog/2024-11-12-earth-data-sharing-at-reasonable-scale-with-open-source-tools-4ccea43679e6.md",
    fallbackTitle: "Earth Data Sharing at Reasonable Scale with Open Source Tools",
  },
  {
    key: "2024-10-26-cloud-storage-for-earth-data-unlocking-its-true-potential-with-the-right-data-management-tools-4306244ec870",
    date: "2024-10-26",
    file: "blog/2024-10-26-cloud-storage-for-earth-data-unlocking-its-true-potential-with-the-right-data-management-tools-4306244ec870.md",
    fallbackTitle:
      "Cloud Storage for Earth Data - Unlocking Its True Potential with the Right Data Management Tools",
  },
  {
    key: "2024-10-02-the-reproducibility-challenge-with-cloud-workspaces-b9e53da2b302",
    date: "2024-10-02",
    file: "blog/2024-10-02-the-reproducibility-challenge-with-cloud-workspaces-b9e53da2b302.md",
    fallbackTitle: "The Reproducibility Challenge with Cloud Workspaces",
  },
];

const postList = document.querySelector("#post-list");
const postTitle = document.querySelector("#post-title");
const postMeta = document.querySelector("#post-meta");
const postOrigin = document.querySelector("#post-origin");
const postContent = document.querySelector("#post-content");
const postError = document.querySelector("#post-error");
const canonicalLink = document.querySelector('link[rel="canonical"]');

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isExternalHref(href) {
  return /^(https?:\/\/|mailto:)/i.test(href);
}

function isSafeLocalHref(href) {
  return /^(#|\.{0,2}\/|[a-z0-9][a-z0-9/_\-.]*(?:[?#].*)?)$/i.test(href);
}

function renderLink(label, href) {
  if (!href || (!isExternalHref(href) && !isSafeLocalHref(href))) {
    return escapeHtml(label);
  }

  const safeHref = escapeHtml(href);
  const safeLabel = renderInline(label);
  if (isExternalHref(href)) {
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
  }

  return `<a href="${safeHref}">${safeLabel}</a>`;
}

function renderImage(alt, src, caption = "") {
  if (!src || (!isExternalHref(src) && !isSafeLocalHref(src))) {
    return "";
  }

  const safeSrc = escapeHtml(src);
  const safeAlt = escapeHtml(alt);
  const renderedCaption = caption ? `<figcaption>${renderInline(caption)}</figcaption>` : "";
  return `<figure class="blog-figure"><img src="${safeSrc}" alt="${safeAlt}" loading="lazy" />${renderedCaption}</figure>`;
}

function renderInline(text) {
  const tokens = [];
  const stash = (html) => {
    const token = `\u0000${tokens.length}\u0000`;
    tokens.push(html);
    return token;
  };

  let value = text.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${escapeHtml(code)}</code>`));
  value = value.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) =>
    stash(renderLink(label, href)),
  );
  value = escapeHtml(value);
  value = value
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  tokens.forEach((html, index) => {
    value = value.replaceAll(`\u0000${index}\u0000`, html);
  });

  return value;
}

function normalizeTitle(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseFrontMatter(raw) {
  if (!raw.startsWith("---\n")) {
    return { meta: {}, body: raw };
  }

  const endIndex = raw.indexOf("\n---", 4);
  if (endIndex === -1) {
    return { meta: {}, body: raw };
  }

  const block = raw.slice(4, endIndex).trim();
  const body = raw.slice(endIndex + 4).replace(/^\n+/, "");
  const meta = {};

  block.split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator === -1) {
      return;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value.replaceAll('\\"', '"');
  });

  return { meta, body };
}

function flushParagraph(state) {
  if (state.paragraph.length === 0) {
    return;
  }

  state.html += `<p>${renderInline(state.paragraph.join(" "))}</p>`;
  state.paragraph = [];
}

function flushList(state) {
  if (state.listItems.length === 0) {
    return;
  }

  const tag = state.listType === "ordered" ? "ol" : "ul";
  state.html += `<${tag}>`;
  state.listItems.forEach((item) => {
    state.html += `<li>${renderInline(item)}</li>`;
  });
  state.html += `</${tag}>`;
  state.listItems = [];
  state.listType = null;
}

function flushBlockquote(state) {
  if (state.blockquote.length === 0) {
    return;
  }

  const paragraphs = state.blockquote
    .join("\n")
    .split(/\n{2,}/)
    .map((part) => part.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .map((part) => `<p>${renderInline(part)}</p>`)
    .join("");
  state.html += `<blockquote>${paragraphs}</blockquote>`;
  state.blockquote = [];
}

function flushAll(state) {
  flushParagraph(state);
  flushList(state);
  flushBlockquote(state);
}

function renderMarkdown(markdown) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const state = {
    html: "",
    paragraph: [],
    listItems: [],
    listType: null,
    blockquote: [],
    inCode: false,
    codeLines: [],
    codeLanguage: "",
  };

  const flushCode = () => {
    state.html += `<pre><code>${escapeHtml(state.codeLines.join("\n"))}</code></pre>`;
    state.inCode = false;
    state.codeLines = [];
    state.codeLanguage = "";
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (state.inCode) {
      if (/^```/.test(trimmed)) {
        flushCode();
      } else {
        state.codeLines.push(line);
      }
      return;
    }

    if (/^```/.test(trimmed)) {
      flushAll(state);
      state.inCode = true;
      state.codeLanguage = trimmed.replace(/^```/, "");
      return;
    }

    if (!trimmed) {
      flushAll(state);
      return;
    }

    if (/^>\s?/.test(trimmed)) {
      flushParagraph(state);
      flushList(state);
      state.blockquote.push(trimmed.replace(/^>\s?/, ""));
      return;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      flushAll(state);
      const level = trimmed.match(/^#+/)[0].length;
      const text = trimmed.replace(/^#{1,6}\s+/, "");
      state.html += `<h${level}>${renderInline(text)}</h${level}>`;
      return;
    }

    const imageMatch = trimmed.match(
      /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/,
    );
    if (imageMatch) {
      flushAll(state);
      const [, alt, src, caption = ""] = imageMatch;
      state.html += renderImage(alt, src, caption);
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph(state);
      flushBlockquote(state);
      if (state.listType !== "unordered") {
        flushList(state);
        state.listType = "unordered";
      }
      state.listItems.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph(state);
      flushBlockquote(state);
      if (state.listType !== "ordered") {
        flushList(state);
        state.listType = "ordered";
      }
      state.listItems.push(trimmed.replace(/^\d+\.\s+/, ""));
      return;
    }

    state.paragraph.push(trimmed);
  });

  if (state.inCode) {
    flushCode();
  }
  flushAll(state);
  return state.html;
}

function setMetaByName(name, content) {
  const node = document.querySelector(`meta[name="${name}"]`);
  if (node) {
    node.setAttribute("content", content);
  }
}

function setMetaByProperty(property, content) {
  const node = document.querySelector(`meta[property="${property}"]`);
  if (node) {
    node.setAttribute("content", content);
  }
}

function getOriginLabel(meta) {
  if (meta.origin_title) {
    return meta.origin_title;
  }

  try {
    return new URL(meta.origin_url).hostname.replace(/^www\./, "");
  } catch {
    return "the original page";
  }
}

function markActivePost(postKey) {
  document.querySelectorAll("[data-post-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.postLink === postKey);
  });
}

function renderPostList() {
  postList.innerHTML = POSTS.map(
    (post) =>
      `<a href="blog.html?post=${post.key}" data-post-link="${post.key}"><span class="blog-post-list__date">${escapeHtml(
        post.date,
      )}</span><span class="blog-post-list__title">${escapeHtml(
        post.fallbackTitle,
      )}</span></a>`,
  ).join("");
}

async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const requestedPost = params.get("post") || POSTS[0].key;
  const selected = POSTS.find((post) => post.key === requestedPost) || POSTS[0];
  const postUrl = `https://versioneer.at/blog.html?post=${selected.key}`;

  markActivePost(selected.key);

  try {
    const response = await fetch(selected.file, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${selected.file}: ${response.status}`);
    }

    const raw = await response.text();
    const { meta, body } = parseFrontMatter(raw);
    const title = meta.title || selected.fallbackTitle;
    let cleanedBody = body.trim();
    const leadingHeadingMatch = cleanedBody.match(/^#\s+(.+?)(?:\n+|$)/);

    if (
      leadingHeadingMatch &&
      normalizeTitle(leadingHeadingMatch[1]) === normalizeTitle(title)
    ) {
      cleanedBody = cleanedBody.slice(leadingHeadingMatch[0].length).trim();
    }

    postTitle.textContent = title;
    postMeta.textContent = [meta.date, meta.tags].filter(Boolean).join(" · ");

    if (meta.origin_url) {
      postOrigin.innerHTML = `Also published at ${renderLink(
        getOriginLabel(meta),
        meta.origin_url,
      )}.`;
      postOrigin.hidden = false;
    } else {
      postOrigin.hidden = true;
      postOrigin.innerHTML = "";
    }

    postContent.innerHTML = renderMarkdown(cleanedBody);

    const pageTitle = `${title} | Versioneer Blog`;
    const pageDescription =
      meta.description ||
      "Versioneer blog posts on governed data products and platform engineering.";

    document.title = pageTitle;
    setMetaByName("description", pageDescription);
    setMetaByName("twitter:title", pageTitle);
    setMetaByName("twitter:description", pageDescription);
    setMetaByProperty("og:title", pageTitle);
    setMetaByProperty("og:description", pageDescription);
    setMetaByProperty("og:url", postUrl);

    if (meta.image) {
      const absoluteImage = new URL(meta.image, window.location.origin).href;
      setMetaByName("twitter:image", absoluteImage);
      setMetaByProperty("og:image", absoluteImage);
    }

    if (canonicalLink) {
      canonicalLink.setAttribute("href", postUrl);
    }

    postError.hidden = true;
  } catch (error) {
    console.error(error);
    postTitle.textContent = selected.fallbackTitle;
    postMeta.textContent = "The blog post could not be loaded.";
    postOrigin.hidden = true;
    postContent.innerHTML = "";
    postError.hidden = false;
  }
}

renderPostList();
loadPost();
