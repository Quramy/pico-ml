import React from "react";
import cx from "classnames";

import { useProgramStream } from "../../hooks/use-program-stream";
import styles from "./index.css";
import { toHex } from "../../functions/hex";

function createTableFrom(bin: Uint8Array) {
  const lines: {
    address: string;
    values: readonly string[];
  }[] = [];
  let line: {
    address: string;
    values: string[];
  };
  for (let i = 0; i < bin.byteLength; i += 2) {
    if (i % 0x10 === 0) {
      line = {
        address: toHex(i, 8),
        values: [],
      };
      lines.push(line);
    }
    if (i + 1 < bin.byteLength) {
      line!.values.push(toHex(bin[i], 2) + toHex(bin[i + 1], 2));
    } else {
      line!.values.push(toHex(bin[i], 2));
    }
  }
  return lines;
}

export function BinaryViewer() {
  const result = useProgramStream("wasm$", new Uint8Array());
  if (!result.ready) return null;
  if (result.error) {
    return <div>Error</div>;
  }
  const rows = createTableFrom(result.data);
  return (
    <div className={cx(styles.root)}>
      <table className={cx(styles.table)}>
        <tbody>
          {rows.map(row => (
            <tr key={row.address}>
              <th className={styles.addressCell}>{row.address}</th>
              {row.values.map((v, i) => (
                <td className={styles.cell} key={i}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}