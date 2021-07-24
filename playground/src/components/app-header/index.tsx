import { useState, useContext, useCallback } from "react";
import cx from "classnames";
import styles from "./index.css";
import { useSettingsValue } from "../../hooks/use-settings-value";
import { CODE_EXAMPLES } from "../../constants/code-examples";
import { programContext } from "../../context/program-context";

type Props = {
  readonly className?: string;
};

export function AppHeader({ className }: Props) {
  const program = useContext(programContext);
  const [dispatchUsingInferredType, setDispatchUsingInferredType] = useSettingsValue("dispatchUsingInferredType");
  const [reduceFloatInstructions, setReduceFloatInstructions] = useSettingsValue("reduceFloatInstructions");
  const [enableNameSection, setenableNameSection] = useSettingsValue("enableNameSection");
  const [settingsIsOpening, setSettingsIsOpening] = useState(false);
  const [examplesIsOpening, setExamplesIsOpening] = useState(false);
  const closeSettings = useCallback(() => setSettingsIsOpening(false), []);
  const closeExamples = useCallback(() => setExamplesIsOpening(false), []);
  const registerClickOutside = (cb: () => void) => (elem: HTMLDivElement | null) => {
    if (elem) {
      document.addEventListener("click", cb, { once: true });
    } else {
      document.removeEventListener("click", cb);
    }
  };
  return (
    <header className={cx(className, styles.root)}>
      <div className={styles.main}>
        <h1 className={styles.heading}>PicoML Playground</h1>
        <div className={cx(styles.buttonWrap, { [styles.open]: examplesIsOpening })} onClick={e => e.stopPropagation()}>
          <button className={styles.textButton} onClick={() => setExamplesIsOpening(!examplesIsOpening)}>
            Examples
          </button>
          {examplesIsOpening && (
            <div className={cx(styles.panel, styles.left)} ref={registerClickOutside(closeExamples)}>
              <ul className={styles.exampleList}>
                {CODE_EXAMPLES.map(({ name, code }) => (
                  <li className={styles.exampleItem} key={name}>
                    <button
                      onClick={() => {
                        program.rawCode$.next(code.trim());
                        closeExamples();
                      }}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className={styles.subActions}>
        <div className={cx(styles.buttonWrap, { [styles.open]: settingsIsOpening })} onClick={e => e.stopPropagation()}>
          <button className={styles.textButton} onClick={() => setSettingsIsOpening(!settingsIsOpening)}>
            Settings
          </button>
          {settingsIsOpening && (
            <div className={cx(styles.panel, styles.right)} ref={registerClickOutside(closeSettings)}>
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
                    checked={reduceFloatInstructions}
                    onChange={() => setReduceFloatInstructions(!reduceFloatInstructions)}
                  />
                  <span>Reduce Float Instructions</span>
                </label>
                <p>If enabled, redundant instructions about floating-point number will be removed.</p>
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
