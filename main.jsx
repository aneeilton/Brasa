import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// (arquivo movido para a raiz do projeto — sem pasta src)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
