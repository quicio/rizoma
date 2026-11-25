(function () {
  "use strict";

  var dialog = document.getElementById("rz-search");
  if (!dialog) return;

  var opener = document.querySelector("[data-search-open]");
  var close = dialog.querySelector("[data-search-close]");
  var input = dialog.querySelector("[data-search-input]") || document.getElementById("rz-search-input");
  var results = dialog.querySelector("[data-search-results]");
  var empty = dialog.querySelector("[data-search-empty]");
  var index = null;
  var loading = false;

  function base() {
    var value = (document.body && document.body.getAttribute("data-base")) || "/";
    return value.replace(/\/+$/, "");
  }

  function load() {
    if (index || loading) return Promise.resolve(index);
    loading = true;
    return fetch(base() + "/rizoma-index.json")
      .then(function (response) { return response.json(); })
      .then(function (data) {
        index = [];
        (data.exploraciones || []).forEach(function (item) {
          index.push({
            kind: "Exploración",
            title: item.title,
            meta: (item.nodos || 0) + " nodos · " + (item.corpus || 0) + " piezas",
            url: item.url
          });
        });
        (data.nodosList || []).forEach(function (item) {
          index.push({
            kind: "Nodo",
            title: item.title,
            meta: item.definition || "vocabulario compartido",
            url: item.url
          });
        });
        (data.anexos || []).forEach(function (item) {
          index.push({
            kind: item.tipo || "Anexo",
            title: item.title,
            meta: item.exploracion || "aparato",
            url: item.url
          });
        });
        loading = false;
        return index;
      })
      .catch(function () {
        loading = false;
        return [];
      });
  }

  function normalize(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function render(query) {
    if (!results) return;
    var q = normalize(query.trim());
    results.innerHTML = "";
    if (!q) {
      if (empty) empty.hidden = true;
      return;
    }
    var matches = (index || []).filter(function (item) {
      return normalize(item.title + " " + item.kind + " " + item.meta).indexOf(q) !== -1;
    }).slice(0, 14);

    matches.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "rz-search__result";
      var a = document.createElement("a");
      a.href = item.url;
      var kind = document.createElement("span");
      kind.className = "rz-search__kind";
      kind.textContent = item.kind;
      var title = document.createElement("span");
      title.className = "rz-search__title";
      title.textContent = item.title;
      var meta = document.createElement("span");
      meta.className = "rz-search__meta";
      meta.textContent = item.meta;
      a.appendChild(kind);
      a.appendChild(title);
      a.appendChild(meta);
      li.appendChild(a);
      results.appendChild(li);
    });

    if (empty) empty.hidden = matches.length > 0;
  }

  function open() {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    load().then(function () {
      if (input) {
        input.value = "";
        setTimeout(function () { input.focus(); }, 30);
      }
    });
  }

  function shut() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  if (opener) {
    opener.addEventListener("click", function (event) {
      event.preventDefault();
      open();
    });
  }

  if (close) close.addEventListener("click", shut);

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) shut();
  });

  if (input) {
    input.addEventListener("input", function () {
      load().then(function () { render(input.value); });
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") shut();
      if (event.key === "Enter") {
        var first = results && results.querySelector("a");
        if (first) window.location.href = first.href;
      }
    });
  }
})();
