import { useState, useCallback } from "react";
import cx from "classnames";
import styles from "./index.css";
import { useSettingsValue } from "../../hooks/use-settings-value";

type Props = {
  readonly className?: string;
};

export function AppHeader({ className }: Props) {
  const [enabledNameSection, setEnabledNameSection] = useSettingsValue("enabledNameSection");
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
                    checked={enabledNameSection}
                    onChange={() => setEnabledNameSection(!enabledNameSection)}
                  />
                  <span>Emit WASM name section</span>
                </label>
                <p>If enabled, the names of functions or variables are refrected to Chrome devtool. </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
