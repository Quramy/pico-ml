import cx from "classnames";
import styles from "./index.css";
import { JsonViewer } from "../json";
import { useProgramStream } from "../../hooks/use-program-stream";

export function AstViewer() {
  const result = useProgramStream("parseResult$");
  if (!result.ready) return null;
  if (result.error) return <div>Error</div>;
  return (
    <div className={cx(styles.root)}>
      <JsonViewer src={result.data} collapsed={2} enableClipboard={false} />
    </div>
  );
}
