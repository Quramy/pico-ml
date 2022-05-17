import cx from "classnames";

import { toHex } from "pico-ml";
import { useProgramStream } from "../../hooks/use-program-stream";
import styles from "./index.css";

function n2c(n: number) {
  return n < 0x20 || n >= 0x7f ? "." : String.fromCharCode(n);
}

function createTableFrom(bin: Uint8Array) {
  const lines: {
    address: string;
    values: readonly string[];
    ascii: string;
  }[] = [];
  let line: {
    address: string;
    values: string[];
    ascii: string;
  };
  for (let i = 0; i < bin.byteLength; i += 2) {
    if (i % 0x10 === 0) {
      line = {
        address: toHex(i, 8),
        values: [],
        ascii: "",
      };
      lines.push(line);
    }
    line!.ascii += n2c(bin[i]);
    if (i + 1 < bin.byteLength) {
      line!.ascii += n2c(bin[i + 1]);
      line!.values.push(toHex(bin[i], 2) + toHex(bin[i + 1], 2));
    } else {
      line!.values.push(toHex(bin[i], 2));
    }
  }
  if (lines.length) {
    const lastLine = lines[lines.length - 1];
    lastLine.values = [...lastLine.values, ...[...new Array(8 - lastLine.values.length)].map(() => "")];
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
              <td className={styles.asciiCell}>{row.ascii}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
