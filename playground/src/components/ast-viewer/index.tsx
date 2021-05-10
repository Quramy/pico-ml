import React, { useEffect, useState, useContext } from "react";
import ReactJson from "react-json-view";
import cx from "classnames";
import { programContext } from "../../context/program-context";
import styles from "./index.css";

export function AstViewer() {
  const ctx = useContext(programContext);
  const [hasError, setHasError] = useState(false);
  const [tree, setTree] = useState<any>({});
  useEffect(() => {
    const subscription = ctx.parseResult$.subscribe(pr => {
      if (!pr.ok) {
        setHasError(true);
      } else {
        setHasError(false);
        setTree(pr.value);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  if (hasError) {
    return <div>Error</div>;
  }
  return (
    <div className={cx(styles.root)}>
      <ReactJson src={tree} theme="monokai" collapsed={2} />
    </div>
  );
}
