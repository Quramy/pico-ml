import Prism from "prismjs";
import { useState, useContext, useEffect } from "react";
import cx from "classnames";
import "prismjs/components/prism-wasm";

import { programContext } from "../../context/program-context";
import "../../styles/prism-theme.css";

import styles from "./index.css";

export function WatViewer() {
  const [code, setCode] = useState({ __html: "" });
  const [hasError, setHasError] = useState(false);
  const ctx = useContext(programContext);
  useEffect(() => {
    const subscription = ctx.wat$.subscribe(r => {
      if (r.ok) {
        setHasError(false);
        const html = Prism.highlight(r.value, Prism.languages["wasm"], "wasm");
        setCode({ __html: html });
      } else {
        console.error(r.value.message);
        setHasError(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  if (hasError) {
    return <div>Error</div>;
  }
  return (
    <div className={cx(styles.root)}>
      <pre className="language-wasm">
        <code className="language-wasm" dangerouslySetInnerHTML={code} />
      </pre>
    </div>
  );
}
