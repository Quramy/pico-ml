import React, { useState, useRef, useEffect, useContext } from "react";
import cx from "classnames";
import { ValueTypeTree } from "../../service/program";
import styles from "./index.css";
import { IconButton } from "../icon-button";
import { Play, Stop } from "../icons";
import { programContext } from "../../context/program-context";

type LogMessage =
  | {
      readonly type: "error";
      readonly message: string;
    }
  | {
      readonly type: "success";
      readonly value: ValueTypeTree;
    };

const floatFormatter = new Intl.NumberFormat(undefined, { useGrouping: false, minimumFractionDigits: 1 });

function EvaluatedValueNode({ node }: { node: ValueTypeTree }): React.ReactElement | null {
  if (node.kind === "Int") {
    return <span className={styles.intNode}>{`${node.value}`}</span>;
  } else if (node.kind === "Float") {
    return <span className={styles.intNode}>{`${floatFormatter.format(node.value)}`}</span>;
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
  const [logs, setArr] = useState<LogMessage[]>([]);
  const context = useContext(programContext);
  useEffect(
    () =>
      context.evaluatedResult$.subscribe(logs => {
        setArr(logs);
        bottomElem.current?.scrollIntoView();
      }).unsubscribe,
    [],
  );
  return (
    <div className={styles.root}>
      <div className={styles.buttonsArea}>
        <IconButton label="Evaluate expression" title="Evaluate expression" onClick={() => context.execute$.next(null)}>
          <Play />
        </IconButton>
        <IconButton label="Clear logs" title="Clear logs" onClick={() => context.execute$.next(true)}>
          <Stop />
        </IconButton>
      </div>
      <ul className={styles.logList}>
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
