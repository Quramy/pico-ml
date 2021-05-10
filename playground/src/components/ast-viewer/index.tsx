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
      <ReactJson
        src={tree}
        collapsed={2}
        enableClipboard={false}
        theme={{
          base00: "#161821",
          base01: "#1e2132",
          base02: "#45493e",
          base03: "#6b7089",
          base04: "#6b7089",
          base05: "#c6c8d1",
          base06: "#c6c8d1",
          base07: "#c6c8d1",
          base08: "#ceb0b6",
          base09: "#89b8c2",
          base0A: "#84a0c6",
          base0B: "#89b8c2",
          base0C: "#89b8c2",
          base0D: "#84a0c6",
          base0E: "#84a0c6",
          base0F: "#686f9a",
        }}
      />
    </div>
  );
}
