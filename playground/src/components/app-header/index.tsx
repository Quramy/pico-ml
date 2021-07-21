import { useState, useCallback } from "react";
import cx from "classnames";
import styles from "./index.css";
import { useSettingsValue } from "../../hooks/use-settings-value";

type Props = {
  readonly className?: string;
};

export function AppHeader({ className }: Props) {
  const [dispatchUsingInferredType, setDispatchUsingInferredType] = useSettingsValue("dispatchUsingInferredType");
  const [enableNameSection, setenableNameSection] = useSettingsValue("enableNameSection");
  const [settingsIsOpening, setSettingsIsOpening] = useState(false);
  const closeCb = useCallback(() => setSettingsIsOpening(false), []);
  const registerClickOutside = (elem: HTMLDivElement | null) => {
    if (elem) {
      document.addEventListener("click", closeCb, { once: true });
    } else {
      document.removeEventListener("click", closeCb);
    }
  };
  return (
    <header className={cx(className, styles.root)}>
      <h1 className={styles.heading}>PicoML Playground</h1>
      <div className={styles.subActions}>
        <div className={cx(styles.buttonWrap, { [styles.open]: settingsIsOpening })} onClick={e => e.stopPropagation()}>
          <button className={styles.textButton} onClick={() => setSettingsIsOpening(!settingsIsOpening)}>
            Settings
          </button>
          {settingsIsOpening && (
            <div className={styles.panel} ref={registerClickOutside}>
              <div className={styles.settingItem}>
                <label>
                  <input
                    type="checkbox"
                    checked={dispatchUsingInferredType}
                    onChange={() => setDispatchUsingInferredType(!dispatchUsingInferredType)}
                  />
                  <span>Static Dispatch</span>
                </label>
                <p>
                  If enabled, compilation of some polymorphic operations will be optimized using inferred type
                  statically.
                </p>
              </div>
              <div className={styles.settingItem}>
                <label>
                  <input
                    type="checkbox"
                    checked={enableNameSection}
                    onChange={() => setenableNameSection(!enableNameSection)}
                  />
                  <span>Emit WASM name section</span>
                </label>
                <p>If enabled, the names of functions or variables are reflected to Chrome devtool. </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
