import { ReactNode } from "react";

import styles from "./index.css";

type Props = {
  readonly children: ReactNode;
  readonly sectionName?: string;
};

export function Pane({ children, sectionName }: Props) {
  return (
    <div className={styles.root}>
      {sectionName && <h2 className={styles.sectionName}>{sectionName}</h2>}
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
