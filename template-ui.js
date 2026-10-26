(function () {
  "use strict";

  var script = document.currentScript;
  var homeHref = (script && script.getAttribute("data-home")) || "index.html";

  function fileName() {
    var name = decodeURIComponent(location.pathname.split("/").pop() || "template.html");
    if (!/\.html?$/i.test(name)) name += ".html";
    return name;
  }

  function serialize(doc) {
    doc.querySelectorAll("[data-template-ui]").forEach(function (el) { el.remove(); });
    var doctype = doc.doctype ? "<!DOCTYPE html>\n" : "";
    return doctype + doc.documentElement.outerHTML;
  }

  function save(text) {
    var blob = new Blob([text], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function download() {
    fetch(location.href, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("fetch failed");
        return res.text();
      })
      .then(function (text) {
        save(serialize(new DOMParser().parseFromString(text, "text/html")));
      })
      .catch(function () {
        save(serialize(document.cloneNode(true)));
      });
  }

  function inject() {
    if (!document.body) return;

    var host = document.createElement("div");
    host.setAttribute("data-template-ui", "");
    host.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:2147483647;";

    var shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = [
      "<style>",
      ".bar{display:flex;gap:8px;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}",
      "a,button{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:999px;font-size:13.5px;font-weight:600;line-height:1;cursor:pointer;text-decoration:none;border:1px solid #e2e8f0;background:#fff;color:#0a2540;box-shadow:0 2px 10px rgba(15,23,42,.12);transition:transform .12s ease,box-shadow .12s ease,background .12s ease}",
      "a:hover,button:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(15,23,42,.18)}",
      "button{border-color:#166534;background:#166534;color:#fff}",
      "button:hover{background:#14532d}",
      "</style>",
      "<div class='bar'>",
      "<a href='" + homeHref + "'>&#8592; Back to Home</a>",
      "<button type='button' data-download>&#8681; Download Template</button>",
      "</div>"
    ].join("");

    shadow.querySelector("[data-download]").addEventListener("click", download);
    document.body.appendChild(host);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
