import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <ThemeProvider>
      <App />
      <Toaster position="top-right" toastOptions={{ style: { background: "#131929", color: "#fff", border: "1px solid #1C2540" } }} />
    </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
