import React from "react";
import SplitPane from "react-split-pane";
import { Editor } from "../editor";
import { CodeProvider } from "../../context/code-context";
import { Wat } from "../wat";
import { AstViewer } from "../ast-viewer";

export function App() {
  const code = "(* Write ML Code here ! *)\n\nif true then 1 * 2 else 4 - 3";
  return (
    <CodeProvider initialContent={code}>
      <SplitPane split="vertical" defaultSize="45%">
        <Editor />
        <SplitPane split="horizontal" defaultSize="50%">
          <AstViewer />
          <Wat />
        </SplitPane>
      </SplitPane>
    </CodeProvider>
  );
}
