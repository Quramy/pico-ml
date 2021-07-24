import { Observable, BehaviorSubject } from "rxjs";
import { OutputOptions } from "pico-ml";

export type SettingsOptions = OutputOptions;

type PartialOptions = { [K in keyof SettingsOptions]?: boolean };

export interface SettingsService {
  readonly patch: (body: PartialOptions) => void;
  readonly settings$: Observable<SettingsOptions>;
}

export const defaultSettingOptions: SettingsOptions = {
  enableNameSection: true,
  dispatchUsingInferredType: true,
  reduceInstructions: true,
};

export function createSettingsService(): SettingsService {
  const subject$ = new BehaviorSubject(defaultSettingOptions);
  return {
    patch: body => {
      const current = subject$.getValue();
      subject$.next({ ...current, ...body });
    },
    settings$: subject$.asObservable(),
  };
}
