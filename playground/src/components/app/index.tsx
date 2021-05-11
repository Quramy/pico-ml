import React from "react";
import SplitPane from "react-split-pane";
import { Editor } from "../editor";
import { ProgramProvider } from "../../context/program-context";
import { WatViewer } from "../wat-viewer";
import { AstViewer } from "../ast-viewer";
import { BinaryViewer } from "../binary-viewer";

import styles from "./index.css";
import { EvaluatedLog } from "../evaluated-log";

const code = `
(*                                                                  *)
(*                 Welcome to PicoML Playground!                    *)
(*                                                                  *)
(* Type the folloting to compile and execute the ML expression:     *)
(* - win: Ctrl + Enter                                              *)
(* - mac: Command + Enter                                           *)

if true then 1 + 2 * 3 else 0
`;

export function App() {
  return (
    <ProgramProvider initialContent={code.trim()}>
      <SplitPane resizerClassName={styles.resizer} split="vertical" defaultSize="45%">
        <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="70%">
          <Editor />
          <EvaluatedLog />
        </SplitPane>
        <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="45%">
          <AstViewer />
          <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="65%">
            <WatViewer />
            <BinaryViewer />
          </SplitPane>
        </SplitPane>
      </SplitPane>
    </ProgramProvider>
  );
}
