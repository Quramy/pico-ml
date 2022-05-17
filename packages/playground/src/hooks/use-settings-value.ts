import { useContext, useState, useEffect, useCallback } from "react";
import { scan, filter } from "rxjs/operators";
import { settingsContext } from "../context/program-context";
import { defaultSettingOptions, SettingsOptions } from "../service/settings";

export function useSettingsValue<
  K extends keyof SettingsOptions & keyof typeof defaultSettingOptions,
  V extends SettingsOptions[K],
>(key: K) {
  const service = useContext(settingsContext);
  const [value, setValue] = useState(defaultSettingOptions[key]);
  useEffect(
    () =>
      service.settings$
        .pipe(
          scan((prev, current) => ({ prev: prev.current, current }), {
            current: defaultSettingOptions,
            prev: null as SettingsOptions | null,
          }),
          filter(x => !x.prev || x.prev[key] !== x.current[key]),
        )
        .subscribe(({ current }) => setValue(current[key])).unsubscribe,
    [],
  );
  const setter = useCallback((v: V) => service.patch({ [key]: v }), [service]);
  return [value, setter] as [V, (v: V) => void];
}
