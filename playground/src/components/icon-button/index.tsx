import { ButtonHTMLAttributes, forwardRef, ReactNode, ForwardedRef } from "react";
import cx from "classnames";

import styles from "./index.css";

type ButtunProps = ButtonHTMLAttributes<HTMLButtonElement>;

type Props = ButtunProps & {
  readonly label: string;
  readonly className?: string;
  readonly children: ReactNode;
};

function IconButtonFn({ label, children, className, ...props }: Props, ref: ForwardedRef<HTMLButtonElement>) {
  return (
    <button {...props} className={cx(className, styles.root)} aria-label={label} ref={ref}>
      {children}
    </button>
  );
}

export const IconButton = forwardRef(IconButtonFn);
