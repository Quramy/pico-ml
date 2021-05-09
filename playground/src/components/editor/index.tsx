import React, { useContext } from "react";
import cx from "classnames";
import { setupEditor } from "../../editor";
import styles from "./index.css";
import { codeContext } from "../../context/code-context";

export function Editor() {
  const ctx = useContext(codeContext);
  return <div className={cx(styles.root)} ref={ref => setupEditor(ref, ctx)} />;
}
