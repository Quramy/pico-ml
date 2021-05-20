import React, { createContext } from "react";
import type { BehaviorSubject } from "rxjs";
import { Program, createProgram } from "../service/program";
import { SettingsService, createSettingsService } from "../service/settings";

type Props = {
  readonly code$: BehaviorSubject<string>;
  readonly children: React.ReactNode;
};

const settingsCtx = createContext<SettingsService>(null as any);
const SettingsProviderInner = settingsCtx.Provider;
const programCtx = createContext<Program>(null as any);
const ProgramProviderInner = programCtx.Provider;

export function ProgramProvider({ code$, children }: Props) {
  const settingsService = createSettingsService();
  const programService = createProgram({ code$, settingsService });
  return (
    <SettingsProviderInner value={settingsService}>
      <ProgramProviderInner value={programService}>{children}</ProgramProviderInner>
    </SettingsProviderInner>
  );
}

export const programContext = programCtx;
export const settingsContext = settingsCtx;
