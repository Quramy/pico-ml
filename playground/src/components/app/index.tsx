import SplitPane from "react-split-pane";
import { Editor } from "../editor";
import { ProgramProvider } from "../../context/program-context";
import { WatViewer } from "../wat-viewer";
import { AstViewer } from "../ast-viewer";
import { BinaryViewer } from "../binary-viewer";

import styles from "./index.css";
import { EvaluatedLog } from "../evaluated-log";
import { Pane } from "../pane";

const code = `
(*                                                                  *)
(*                 Welcome to PicoML Playground!                    *)
(*                                                                  *)
(* Type the folloing to compile and execute the ML expression:      *)
(* - win: Ctrl + Enter                                              *)
(* - mac: Command + Enter                                           *)

if true then 1 + 2 * 3 else 0
`;

export function App() {
  return (
    <ProgramProvider initialContent={code.trim()}>
      <SplitPane resizerClassName={styles.resizer} split="vertical" defaultSize="43%">
        <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="62%">
          <Pane>
            <Editor />
          </Pane>
          <Pane sectionName="Evaluation Log">
            <EvaluatedLog />
          </Pane>
        </SplitPane>
        <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="38%">
          <Pane sectionName="Expression AST">
            <AstViewer />
          </Pane>
          <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="60%">
            <Pane sectionName="Compiled WAT">
              <WatViewer />
            </Pane>
            <Pane sectionName="Compiled WASM">
              <BinaryViewer />
            </Pane>
          </SplitPane>
        </SplitPane>
      </SplitPane>
      <footer className={styles.footer}>
        Powered by <a href="https://github.com/Quramy/pico-ml">https://github.com/Quramy/pico-ml</a>
      </footer>
    </ProgramProvider>
  );
}
