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
      <SplitPane resizerClassName={styles.resizer} split="vertical" defaultSize="45%">
        <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="70%">
          <Pane>
            <Editor />
          </Pane>
          <Pane>
            <EvaluatedLog />
          </Pane>
        </SplitPane>
        <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="45%">
          <Pane>
            <AstViewer />
          </Pane>
          <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="65%">
            <Pane>
              <WatViewer />
            </Pane>
            <Pane>
              <BinaryViewer />
            </Pane>
          </SplitPane>
        </SplitPane>
      </SplitPane>
    </ProgramProvider>
  );
}
