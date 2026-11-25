(function () {
  "use strict";

  var maps = Array.prototype.slice.call(document.querySelectorAll("[data-cartography]"));
  if (maps.length === 0) return;

  maps.forEach(function (map) {
    var nodes = Array.prototype.slice.call(map.querySelectorAll(".rz-map__node"));
    var edges = Array.prototype.slice.call(map.querySelectorAll(".rz-map__edge"));

    function clear() {
      map.classList.remove("is-focused");
      nodes.forEach(function (node) { node.classList.remove("is-related"); });
      edges.forEach(function (edge) { edge.classList.remove("is-related"); });
    }

    function focus(node) {
      var id = node.getAttribute("data-node");
      if (!id) return;
      var relatedIds = new Set([id]);

      edges.forEach(function (edge) {
        var from = edge.getAttribute("data-from");
        var to = edge.getAttribute("data-to");
        if (from === id) relatedIds.add(to);
        if (to === id) relatedIds.add(from);
      });

      map.classList.add("is-focused");
      nodes.forEach(function (item) {
        item.classList.toggle("is-related", relatedIds.has(item.getAttribute("data-node")));
      });
      edges.forEach(function (edge) {
        var from = edge.getAttribute("data-from");
        var to = edge.getAttribute("data-to");
        edge.classList.toggle("is-related", from === id || to === id);
      });
    }

    nodes.forEach(function (node) {
      node.addEventListener("mouseenter", function () { focus(node); });
      node.addEventListener("focus", function () { focus(node); });
      node.addEventListener("mouseleave", clear);
      node.addEventListener("blur", clear);
    });
  });
})();
