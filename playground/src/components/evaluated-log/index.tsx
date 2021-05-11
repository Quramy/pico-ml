import React, { useRef } from "react";
import cx from "classnames";
import { ValueTypeTree } from "../../service/program";
import { useProgramStream } from "../../hooks/use-program-stream";
import styles from "./index.css";

type LogMessage =
  | {
      readonly type: "error";
      readonly message: string;
    }
  | {
      readonly type: "value";
      readonly value: ValueTypeTree;
    };

function EvaluatedValueNode({ node }: { node: ValueTypeTree }): React.ReactElement | null {
  if (node.kind === "Int") {
    return <span className={styles.intNode}>{`${node.value}`}</span>;
  } else if (node.kind === "Bool") {
    return <span className={styles.boolNode}>{`${node.value}`}</span>;
  } else if (node.kind === "List") {
    return (
      <>
        <span className={styles.lpToken}>[</span>
        {node.value.map((item, i) => (
          <React.Fragment key={i}>
            {React.createElement(EvaluatedValueNode, { node: item })}
            {i !== node.value.length - 1 ? <span className={styles.commaToken}>, </span> : null}
          </React.Fragment>
        ))}
        <span className={styles.rpToken}>]</span>
      </>
    );
  } else if (node.kind === "Function") {
    return <span className={styles.functionNode}>{`${node.value}`}</span>;
  }
  return null;
}

export function EvaluatedLog() {
  const bottomElem = useRef<HTMLSpanElement>(null);
  const arr = useRef<LogMessage[]>([]);
  const result = useProgramStream("evaluatedResult$");
  const logs = arr.current;
  if (!result) return null;
  if (result.error) {
    logs.push({ type: "error", message: result.error.message });
  } else if (result.data) {
    logs.push({ type: "value", value: result.data });
  }
  if (bottomElem.current) {
    bottomElem.current.scrollIntoView();
  }
  return (
    <div className={styles.root}>
      <ul>
        {logs.map((logItem, i) => (
          <li className={styles.logItem} key={i}>
            <span className={styles.logHeader}>result#{i + 1}</span>
            <span className={cx(styles.logBody, { [styles.error]: logItem.type === "error" })}>
              {logItem.type === "error" ? (
                <>
                  <span>Error: </span>
                  <span>{logItem.message}</span>
                </>
              ) : (
                <EvaluatedValueNode node={logItem.value} />
              )}
            </span>
          </li>
        ))}
      </ul>
      <span ref={bottomElem} />
    </div>
  );
}
