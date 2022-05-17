import { useRef, useEffect, useContext } from "react";
import { Subscription } from "rxjs";
import ace from "ace-builds";
import cx from "classnames";

import { Program } from "../../service/program";
import { programContext } from "../../context/program-context";
import styles from "./index.css";

function setupEditor(element: HTMLElement | null, program: Program) {
  if (!element) return;
  const editor = ace.edit(element, {
    mode: "ace/mode/ocaml",
  });
  editor.commands.addCommand({
    name: "executeWasm",
    bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
    exec: () => program.execute$.next(null),
  });

  editor.setTheme("ace/theme/iceberg");

  const editSession = editor.getSession();
  editSession.setTabSize(2);

  editSession.setValue(program.initialContent);

  editor.on("change", () => program.code$.next(editSession.getValue()));
  const subscription = new Subscription();
  subscription.add(program.rawCode$.subscribe(rawCode => editSession.setValue(rawCode)));
  subscription.add(program.diagnostics$.subscribe(diagnostics => editSession.setAnnotations([...diagnostics])));

  editSession.selection.on("changeSelection", () => {
    const range = editSession.selection.getRange();
    program.selection$.next({
      start: {
        line: range.start.row,
        character: range.start.column,
      },
      end: {
        line: range.end.row,
        character: range.end.column,
      },
    });
  });

  const dispose = () => {
    editor.destroy();
    subscription.unsubscribe();
  };

  return dispose;
}

export function Editor() {
  const ref = useRef<HTMLDivElement>(null);
  const program = useContext(programContext);
  useEffect(() => {
    if (!ref.current) return;
    return setupEditor(ref.current, program);
  }, [ref.current, program]);
  return <div className={cx(styles.root)} ref={ref} />;
}
