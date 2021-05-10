import ace from "ace-builds";
import "ace-builds/webpack-resolver"; // tell theme, syntax highlight module url to webpack

import React, { useRef, useEffect, useContext } from "react";
import cx from "classnames";

import { Program } from "../../service/program";
import { programContext } from "../../context/program-context";
import styles from "./index.css";

const aceDefine = (ace as any).define as Function;

aceDefine("ace/theme/iceberg", (_: any, exports: any) => {
  exports.isDark = true;
  exports.cssClass = "ace-iceberg";
});

function setupEditor(element: HTMLElement | null, program: Program) {
  if (!element) return;
  const editor = ace.edit(element, {
    mode: "ace/mode/ocaml",
  });
  editor.setOptions({});

  editor.setTheme("ace/theme/iceberg");

  const editSession = editor.getSession();
  editSession.setTabSize(2);

  editSession.setValue(program.initialContent);

  editor.on("change", () => program.code$.next(editSession.getValue()));
  const subscription = program.diagnostics$.subscribe(diagnostics => editSession.setAnnotations([...diagnostics]));

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
  }, [ref.current]);
  return <div className={cx(styles.root)} ref={ref} />;
}
