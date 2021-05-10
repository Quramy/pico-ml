import ace from "ace-builds";
import "ace-builds/webpack-resolver"; // tell theme, syntax highlight module url to webpack
import React, { useContext } from "react";
import cx from "classnames";

import { Program } from "../../service/program";
import { programContext } from "../../context/program-context";
import styles from "./index.css";

function setupEditor(element: HTMLElement | null, program: Program) {
  if (!element) return;
  const editor = ace.edit(element, {
    mode: "ace/mode/ocaml",
  });
  editor.setOptions({});

  editor.setTheme("ace/theme/monokai");

  const editSession = editor.getSession();
  editSession.setTabSize(2);

  editSession.setValue(program.initialContent);

  editor.on("change", () => program.code$.next(editSession.getValue()));
  program.diagnostics$.subscribe(diagnostics => editSession.setAnnotations([...diagnostics]));

  return editor;
}

export function Editor() {
  const ctx = useContext(programContext);
  return <div className={cx(styles.root)} ref={ref => setupEditor(ref, ctx)} />;
}
