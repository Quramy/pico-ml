import cx from "classnames";
import { CollapsedFieldProps } from "react-json-view";
import styles from "./index.css";
import { JsonViewer } from "../json";
import { useProgramStream } from "../../hooks/use-program-stream";

export function AstViewer() {
  const astResult = useProgramStream("parseResult$");
  const selectedNodeResult = useProgramStream("selectedAstNode$");
  const shouldCollapse = (field: CollapsedFieldProps) => {
    const { _nodeId } = field.src as any as { readonly _nodeId: string };
    if (!selectedNodeResult.data || !selectedNodeResult.data.found) return field.namespace.length >= 3;
    return !selectedNodeResult.data.path.includes(_nodeId);
  };
  if (!astResult.ready) return null;
  if (astResult.error) return <div>Error</div>;
  return (
    <div className={cx(styles.root)}>
      <JsonViewer src={astResult.data} shouldCollapse={shouldCollapse} enableClipboard={false} />
    </div>
  );
}
