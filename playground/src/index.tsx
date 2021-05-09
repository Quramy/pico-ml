import React from "react";
import { render } from "react-dom";
import "./styles/base.css";
import { App } from "./components/app";

const elem = document.getElementById("app")!;

render(<App />, elem);
