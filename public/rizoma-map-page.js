(function () {
  "use strict";

  var stage = document.querySelector("[data-map-stage]");
  if (!stage) return;

  var map = stage.querySelector("[data-cartography]");
  var detail = document.querySelector("[data-map-detail]");
  var nodes = Array.prototype.slice.call(stage.querySelectorAll(".rz-map__node"));
  var anchors = nodes.filter(function (node) { return node.classList.contains("rz-map__node--anchor"); });
  var regular = nodes.filter(function (node) { return !node.classList.contains("rz-map__node--anchor"); });
  var edges = Array.prototype.slice.call(stage.querySelectorAll(".rz-map__edge"));
  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-map-filter]"));
  var views = Array.prototype.slice.call(document.querySelectorAll("[data-map-view]"));

  var detailTitle = detail && detail.querySelector(".rz-map-detail__title");
  var detailDefinition = detail && detail.querySelector(".rz-map-detail__definition");
  var detailMeta = detail && detail.querySelector(".rz-map-detail__meta");
  var detailLink = detail && detail.querySelector("a");

  function updateDetail(node) {
    if (!detail || !node) return;
    var id = node.getAttribute("data-node");
    var title = node.getAttribute("data-title") || "";
    var definition = node.getAttribute("data-definition") || "Nodo del vocabulario compartido.";
    var slugList = (node.getAttribute("data-exploraciones") || "").split(",").filter(Boolean);
    if (detailTitle) detailTitle.textContent = title;
    if (detailDefinition) detailDefinition.textContent = definition;
    if (detailMeta) {
      detailMeta.textContent = slugList.length + (slugList.length === 1 ? " deriva" : " derivas") +
        (slugList.length > 1 ? " · nodo compartido" : " · nodo de una deriva");
    }
    if (detailLink && id) {
      detailLink.href = node.classList.contains("rz-map__node--anchor")
        ? node.getAttribute("href")
        : "#" + id;
    }
  }

  function applyFilter(value) {
    stage.setAttribute("data-filter", value);
    filters.forEach(function (button) {
      var active = button.getAttribute("data-map-filter") === value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var exp01 = stage.getAttribute("data-exp01");
    var exp02 = stage.getAttribute("data-exp02");

    var visibleIds = new Set();

    nodes.forEach(function (node) {
      var isAnchor = node.classList.contains("rz-map__node--anchor");
      var linked = (node.getAttribute("data-exploraciones") || "").split(",");
      var visible = true;

      if (value === "shared") {
        visible = !isAnchor && node.classList.contains("is-shared");
      } else if (value === "exp-01") {
        visible = isAnchor ? node.getAttribute("data-node") === "exp-01" : linked.indexOf(exp01) !== -1;
      } else if (value === "exp-02") {
        visible = isAnchor ? node.getAttribute("data-node") === "exp-02" : linked.indexOf(exp02) !== -1;
      }

      if (visible) {
        visibleIds.add(node.getAttribute("data-node"));
        node.removeAttribute("tabindex");
        node.removeAttribute("aria-hidden");
      } else {
        node.setAttribute("tabindex", "-1");
        node.setAttribute("aria-hidden", "true");
      }
      node.classList.toggle("is-dimmed", !visible);
    });

    edges.forEach(function (edge) {
      var visible = visibleIds.has(edge.getAttribute("data-from")) && visibleIds.has(edge.getAttribute("data-to"));
      edge.classList.toggle("is-dimmed", !visible);
    });
  }

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      applyFilter(button.getAttribute("data-map-filter"));
    });
  });

  views.forEach(function (button) {
    button.addEventListener("click", function () {
      var view = button.getAttribute("data-map-view");
      views.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      stage.setAttribute("data-view", view);
    });
  });

  nodes.forEach(function (node) {
    node.addEventListener("mouseenter", function () { updateDetail(node); });
    node.addEventListener("focus", function () { updateDetail(node); });
  });

  document.querySelectorAll("[data-focus-node]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var id = link.getAttribute("data-focus-node");
      var node = stage.querySelector('.rz-map__node[data-node="' + id + '"]');
      stage.scrollIntoView({ behavior: "smooth", block: "center" });
      if (node) {
        updateDetail(node);
        node.classList.add("is-pinned");
        setTimeout(function () { node.classList.remove("is-pinned"); }, 2600);
      }
    });
  });

  applyFilter("all");
  var initial = stage.querySelector('.rz-map__node[data-node="repeticion"]');
  if (initial) updateDetail(initial);
})();
