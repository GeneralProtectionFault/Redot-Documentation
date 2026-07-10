console.log("[DiagramViewer] Custom JS script loaded!");

// Check if Panzoom is available
function checkPanzoom(callback) {
  if (typeof Panzoom !== "undefined") {
    console.log("[DiagramViewer] Panzoom library found");
    callback();
  } else {
    console.log("[DiagramViewer] Panzoom not loaded yet, loading from CDN...");
    var script = document.createElement("script");
    script.src = "https://unpkg.com/@panzoom/panzoom@4.5.1/dist/panzoom.min.js";
    script.onload = function () {
      console.log("[DiagramViewer] Panzoom loaded from CDN");
      callback();
    };
    script.onerror = function () {
      console.error("[DiagramViewer] Failed to load Panzoom from CDN");
    };
    document.head.appendChild(script);
  }
}

// Initialize panzoom on a mermaid diagram container
function setupDiagramPanZoom(containerElement) {
  console.log(
    "[DiagramViewer] setupDiagramPanZoom called with container:",
    containerElement,
  );

  if (!containerElement) {
    console.error("[DiagramViewer] No container element provided");
    return;
  }

  checkPanzoom(function () {
    // Wait a moment for DOM updates
    setTimeout(function () {
      var svgElement = containerElement.querySelector("svg");
      console.log("[DiagramViewer] SVG element found:", svgElement);

      if (!svgElement) {
        console.error("[DiagramViewer] No SVG found inside container");
        return;
      }

      // Get container dimensions
      var containerWidth = containerElement.clientWidth || 800;
      var containerHeight = containerElement.clientHeight || 600;

      console.log(
        "[DiagramViewer] Container dimensions:",
        containerWidth,
        "x",
        containerHeight,
      );

      // Remove mermaid's max-width constraint
      svgElement.style.maxWidth = "none";
      svgElement.style.maxHeight = "none";
      svgElement.style.width = "100%";
      svgElement.style.height = "100%";
      svgElement.setAttribute("width", String(containerWidth));
      svgElement.setAttribute("height", String(containerHeight));

      console.log(
        "[DiagramViewer] SVG attributes set to:",
        svgElement.getAttribute("width"),
        svgElement.getAttribute("height"),
      );

      // Initialize panzoom
      try {
        var panzoomInstance = Panzoom(svgElement, {
          maxScale: 10,
          minScale: 0.1,
          step: 0.1,
          contain: "outside",
          startScale: 1,
        });

        window.__zoomPan = panzoomInstance;
        window.__zoomLevel = 1.0;

        window.__resetPanZoom = function () {
          console.log("[DiagramViewer] ResetPanZoom called");
          panzoomInstance.reset();
          window.__zoomLevel = 1.0;
        };

        console.log("[DiagramViewer] Panzoom initialized successfully");

        // Log wheel events for debugging
        containerElement.addEventListener(
          "wheel",
          function (e) {
            console.log("[DiagramViewer] Wheel event fired, deltaY:", e.deltaY);
            panzoomInstance.zoomWithWheel(e);
          },
          { passive: false },
        );
      } catch (err) {
        console.error("[DiagramViewer] Error initializing panzoom:", err);
      }
    }, 100);
  });
}

// Auto-initialize when this script loads
(function () {
  console.log("[DiagramViewer] Auto-initializing...");
  var container = document.querySelector(".mermaid");
  if (container) {
    console.log("[DiagramViewer] Found .mermaid container, initializing...");
    setupDiagramPanZoom(container);
  } else {
    console.log(
      "[DiagramViewer] No .mermaid container found yet, will retry...",
    );
    // Retry after a delay in case the element appears later
    setTimeout(function () {
      container = document.querySelector(".mermaid");
      if (container) {
        console.log(
          "[DiagramViewer] Found .mermaid container on retry, initializing...",
        );
        setupDiagramPanZoom(container);
      } else {
        console.log("[DiagramViewer] Still no .mermaid container after retry");
      }
    }, 500);
  }
})();
