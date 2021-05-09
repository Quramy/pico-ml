import React from "react";
import { render } from "react-dom";
import { App } from "./components/app";

const elem = document.getElementById("app")!;

render(<App />, elem);
