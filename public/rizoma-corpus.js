(function () {
  "use strict";

  var dialog = document.getElementById("rz-resource");
  if (!dialog) return;

  var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-corpus-preview]"));
  if (triggers.length === 0) return;

  var kindEl = dialog.querySelector("[data-resource-kind]");
  var titleEl = dialog.querySelector("[data-resource-title]");
  var metaEl = dialog.querySelector("[data-resource-meta]");
  var contentEl = dialog.querySelector("[data-resource-content]");
  var loadingEl = dialog.querySelector("[data-resource-loading]");
  var errorEl = dialog.querySelector("[data-resource-error]");
  var scrollEl = dialog.querySelector("[data-resource-scroll]");
  var closeEl = dialog.querySelector("[data-resource-close]");
  var openLink = dialog.querySelector("[data-resource-link]");
  var errorLink = dialog.querySelector("[data-resource-error-link]");

  var cache = new Map();
  var currentTrigger = null;
  var KNDL_ORIGIN = "https://kndl.quicio.org";

  var REMOVE = [
    "script", "style", "noscript", "iframe", "object", "embed", "form",
    "button", "input", "select", "textarea", "svg", "canvas", "template",
    ".archive-rail", ".reading-breadcrumb", ".codigo-breadcrumb",
    ".atelier-detail__crumb", ".back-button", ".reading-pager", ".poem-series",
    ".reading-next", ".atelier-detail__nav", ".umbral-skip", ".init",
    ".sr-only", ".rastros-seismograph", ".page-title", ".reading-detail-head",
    ".atelier-detail__mast", ".codigo-meta", ".page-meta"
  ].join(",");

  var ALLOWED = new Set([
    "P", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE",
    "PRE", "CODE", "SPAN", "EM", "STRONG", "I", "B", "A", "IMG", "FIGURE",
    "FIGCAPTION", "HR", "BR", "TABLE", "THEAD", "TBODY", "TR", "TD", "TH",
    "DL", "DT", "DD", "ARTICLE", "DIV", "SECTION", "TIME", "SUP", "SUB",
    "SMALL", "MARK"
  ]);

  var TOKENS = /^(c1|k|kd|kn|kr|kt|m|mi|mf|mh|na|nb|nc|nd|ne|nf|ni|nl|nn|no|nt|nv|nx|o|p|pi|s|s1|s2|se|dl|sa|sr)$/;

  function textOf(node) {
    return node ? node.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function absolute(url, base) {
    try {
      return new URL(url, base || KNDL_ORIGIN).href;
    } catch (error) {
      return url;
    }
  }

  function metaFor(main) {
    var selectors = [
      ".reading-detail__meta", ".codigo-meta", ".page-meta",
      ".atelier-detail__tagline", ".atelier-detail__kind", ".atelier-detail__status"
    ];
    var parts = [];

    selectors.forEach(function (selector) {
      var el = main.querySelector(selector);
      if (!el) return;
      var spans = Array.prototype.slice.call(el.querySelectorAll(":scope > span"))
        .map(textOf)
        .filter(Boolean);
      var value = spans.length > 0 ? spans.join(" · ") : textOf(el);
      if (value && parts.indexOf(value) === -1) parts.push(value);
    });

    return parts.slice(0, 4).join(" · ");
  }

  function titleFor(main) {
    var h1 = main.querySelector("h1");
    if (!h1) return "";
    var clone = h1.cloneNode(true);
    clone.querySelectorAll(".sigil, .init, .reading-detail__mark, .page-title__mark").forEach(function (el) {
      el.remove();
    });
    return textOf(clone).replace(/^[~⟡◊⎔⏚⁂◉🜏]\s*/, "");
  }

  function cleanAttributes(root) {
    var elements = Array.prototype.slice.call(root.querySelectorAll("*"));

    elements.forEach(function (el) {
      var tag = el.tagName.toLowerCase();

      if (tag === "script" || tag === "style" || tag === "iframe" || tag === "svg") {
        el.remove();
        return;
      }

      if (!ALLOWED.has(el.tagName)) {
        el.replaceWith.apply(el, Array.prototype.slice.call(el.childNodes));
        return;
      }

      var href = el.getAttribute("href");
      var src = el.getAttribute("src");
      var alt = el.getAttribute("alt");
      var title = el.getAttribute("title");
      var isToken = (tag === "span" || tag === "code") && el.closest("pre, code");
      var isRastroLine = tag === "span" && el.classList.contains("rastro-linea");
      var tokenClass = "";
      if (isRastroLine) tokenClass = " rastro-linea";

      if (isToken) {
        Array.prototype.slice.call(el.classList).forEach(function (name) {
          if (TOKENS.test(name)) tokenClass += " " + name;
        });
      }

      Array.prototype.slice.call(el.attributes).forEach(function (attribute) {
        el.removeAttribute(attribute.name);
      });

      if (tag === "a") {
        if (href && !/^javascript:/i.test(href)) {
          el.setAttribute("href", absolute(href));
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
        if (title) el.setAttribute("title", title);
      } else if (tag === "img") {
        if (src && !/^(data|javascript):/i.test(src)) {
          el.setAttribute("src", absolute(src));
          el.setAttribute("loading", "lazy");
          el.setAttribute("decoding", "async");
        } else {
          el.remove();
          return;
        }
        if (alt !== null) el.setAttribute("alt", alt);
        if (title) el.setAttribute("title", title);
      } else if (tokenClass) {
        el.setAttribute("class", tokenClass.trim());
      } else if (tag === "td" || tag === "th") {
        var colspan = el.getAttribute("colspan");
        var rowspan = el.getAttribute("rowspan");
        if (colspan) el.setAttribute("colspan", colspan);
        if (rowspan) el.setAttribute("rowspan", rowspan);
      }
    });
  }

  function removeEmpty(root) {
    var elements = Array.prototype.slice.call(root.querySelectorAll("div, section, figure, article, p, span"));
    elements.reverse().forEach(function (el) {
      if (el.tagName === "IMG") return;
      if (!el.textContent.trim() && !el.querySelector("img, pre, code, table, hr")) {
        el.remove();
      }
    });
  }

  function extract(html, url) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var main = doc.querySelector("main") || doc.body;
    if (!main) throw new Error("Recurso sin contenido");

    var title = titleFor(main);
    var meta = metaFor(main);
    var clone = main.cloneNode(true);

    clone.querySelectorAll(REMOVE).forEach(function (el) { el.remove(); });
    clone.querySelectorAll("h1").forEach(function (el) { el.remove(); });

    cleanAttributes(clone);
    removeEmpty(clone);

    var fragment = document.createDocumentFragment();
    while (clone.firstChild) fragment.appendChild(clone.firstChild);

    return { title: title, meta: meta, fragment: fragment };
  }

  function load(url) {
    if (cache.has(url)) return cache.get(url);

    var request = fetch(url, { mode: "cors", credentials: "omit" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (html) {
        return extract(html, url);
      })
      .catch(function (error) {
        cache.delete(url);
        throw error;
      });

    cache.set(url, request);
    return request;
  }

  function prefetch(url) {
    if (!url) return;
    load(url).catch(function () {});
  }

  function open(trigger) {
    if (!trigger) return;
    var url = trigger.getAttribute("data-corpus-url");
    if (!url) return;

    currentTrigger = trigger;
    if (kindEl) kindEl.textContent = trigger.getAttribute("data-corpus-kind") || "Recurso";
    if (titleEl) titleEl.textContent = trigger.getAttribute("data-corpus-title") || "Recurso";
    if (metaEl) metaEl.textContent = "";
    if (contentEl) contentEl.replaceChildren();
    if (loadingEl) loadingEl.hidden = false;
    if (errorEl) errorEl.hidden = true;
    if (openLink) openLink.href = url;
    if (errorLink) errorLink.href = url;
    if (scrollEl) scrollEl.scrollTop = 0;
    dialog.setAttribute("aria-busy", "true");

    if (!dialog.open) dialog.showModal();

    load(url)
      .then(function (data) {
        if (currentTrigger !== trigger) return;
        if (titleEl && data.title) titleEl.textContent = data.title;
        if (metaEl) metaEl.textContent = data.meta;
        if (contentEl) contentEl.replaceChildren(data.fragment.cloneNode(true));
        if (loadingEl) loadingEl.hidden = true;
        dialog.removeAttribute("aria-busy");
        if (scrollEl) scrollEl.scrollTop = 0;
      })
      .catch(function () {
        if (currentTrigger !== trigger) return;
        if (loadingEl) loadingEl.hidden = true;
        if (errorEl) errorEl.hidden = false;
        dialog.removeAttribute("aria-busy");
      });
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      open(trigger);
    });

    trigger.addEventListener("pointerenter", function () {
      prefetch(trigger.getAttribute("data-corpus-url"));
    }, { once: true });

    trigger.addEventListener("focus", function () {
      prefetch(trigger.getAttribute("data-corpus-url"));
    }, { once: true });
  });

  if (closeEl) closeEl.addEventListener("click", close);

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) close();
  });

  dialog.addEventListener("close", function () {
    currentTrigger = null;
  });
})();
