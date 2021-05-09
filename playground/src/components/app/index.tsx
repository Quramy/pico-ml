import React from "react";
import SplitPane from "react-split-pane";
import { Editor } from "../editor";
import { CodeProvider } from "../../context/code-context";
import { Wat } from "../wat";

export function App() {
  const code = "1 + 2";
  return (
    <CodeProvider initialContent={code}>
      <SplitPane split="vertical" defaultSize="45%">
        <Editor />
        <Wat />
      </SplitPane>
    </CodeProvider>
  );
}
