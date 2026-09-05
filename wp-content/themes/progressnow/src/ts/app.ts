// Tailwind v4 entry
import "../css/tailwind.css";

// Components
import { mountIslands } from "./islands";
import { initNavigation } from "./navigation";

function init() {
  mountIslands();
  initNavigation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
