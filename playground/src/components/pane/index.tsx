import { ReactNode } from "react";

import styles from "./index.css";

type Props = {
  children: ReactNode;
};

export function Pane({ children }: Props) {
  return <div className={styles.root}>{children}</div>;
}
