import { createRoot } from "react-dom/client";
import "./ace-config";
import "./styles/base.css";
import { App } from "./components/app";

const elem = document.getElementById("app")!;

createRoot(elem).render(<App />);
