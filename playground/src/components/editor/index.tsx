import ace from "ace-builds";
import "ace-builds/webpack-resolver"; // tell theme, syntax highlight module url to webpack
import React, { useContext } from "react";
import cx from "classnames";

import { codeContext, CodeContextValue } from "../../context/code-context";
import styles from "./index.css";

function setupEditor(element: HTMLElement | null, ctx: CodeContextValue) {
  if (!element) return;
  const editor = ace.edit(element, {
    mode: "ace/mode/ocaml",
  });
  editor.setOptions({});

  editor.setTheme("ace/theme/monokai");

  const editSession = editor.getSession();
  editSession.setTabSize(2);

  editSession.setValue(ctx.initialContent);
  editor.on("change", () => {
    ctx.code$.next(editSession.getValue());
  });

  return editor;
}

export function Editor() {
  const ctx = useContext(codeContext);
  return <div className={cx(styles.root)} ref={ref => setupEditor(ref, ctx)} />;
}
