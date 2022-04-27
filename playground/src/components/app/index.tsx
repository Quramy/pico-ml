import type { ReactNode } from "react";
import OriginalSplitPane, { SplitPaneProps } from "react-split-pane";

import { useCodeStream } from "../../hooks/use-code-stream";
import { ProgramProvider } from "../../context/program-context";
import { AppHeader } from "../app-header";
import { Pane } from "../pane";
import { Editor } from "../editor";
import { WatViewer } from "../wat-viewer";
import { AstViewer } from "../ast-viewer";
import { BinaryViewer } from "../binary-viewer";
import { EvaluatedLog } from "../evaluated-log";

import styles from "./index.css";

const initialCode = `
(*                                                                  *)
(*                 Welcome to PicoML Playground!                    *)
(*                                                                  *)
(* Type the folloing to compile and execute the ML expression:      *)
(* - win: Ctrl + Enter                                              *)
(* - mac: Command + Enter                                           *)

if true then 1 + 2 * 3 else 0
`;

export function App() {
  const code$ = useCodeStream(initialCode);
  return (
    <ProgramProvider code$={code$}>
      <AppHeader className={styles.header} />
      <main className={styles.main}>
        <SplitPane resizerClassName={styles.resizer} split="vertical" defaultSize="43%">
          <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="65%">
            <Pane>
              <Editor />
            </Pane>
            <Pane sectionName="Evaluation Log">
              <EvaluatedLog />
            </Pane>
          </SplitPane>
          <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="45%">
            <Pane sectionName="Expression AST">
              <AstViewer />
            </Pane>
            <SplitPane resizerClassName={styles.resizer} split="horizontal" defaultSize="63%">
              <Pane sectionName="Compiled WAT">
                <WatViewer />
              </Pane>
              <Pane sectionName="Compiled WASM">
                <BinaryViewer />
              </Pane>
            </SplitPane>
          </SplitPane>
        </SplitPane>
      </main>
      <footer className={styles.footer}>
        Powered by <a href="https://github.com/Quramy/pico-ml">https://github.com/Quramy/pico-ml</a>
      </footer>
    </ProgramProvider>
  );
}

// Workaround for react-split-pane type mismatching
function SplitPane(props: SplitPaneProps & { readonly children: ReactNode }) {
  return <OriginalSplitPane {...props} />;
}
