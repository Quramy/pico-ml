import React from "react";
import { Editor } from "../editor";
import { CodeProvider } from "../../context/code-context";

export function App() {
  const code = "1 + 2";
  return (
    <CodeProvider initialContent={code}>
      <Editor />
    </CodeProvider>
  );
}
