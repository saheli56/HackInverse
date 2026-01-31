import React from "react";
import ReactDOM from "react-dom/client";
import { ClauseGuardUI } from "../components/ClauseGuardUI";

function injectUI() {
  const existingRoot = document.getElementById("clauseguard-root");
  if (existingRoot) {
    return;
  }

  const rootDiv = document.createElement("div");
  rootDiv.id = "clauseguard-root";
  document.body.appendChild(rootDiv);

  const root = ReactDOM.createRoot(rootDiv);
  root.render(
    <React.StrictMode>
      <ClauseGuardUI />
    </React.StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectUI);
} else {
  injectUI();
}
