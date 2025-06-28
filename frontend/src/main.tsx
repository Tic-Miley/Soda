import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import './App.css'

// 将 App 组件挂载到 HTML 的 "root" 容器中
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
