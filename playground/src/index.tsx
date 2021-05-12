import { render } from "react-dom";
import "./ace-config";
import "./styles/base.css";
import { App } from "./components/app";

const elem = document.getElementById("app")!;

render(<App />, elem);
