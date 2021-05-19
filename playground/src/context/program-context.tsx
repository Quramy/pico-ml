import React, { createContext } from "react";
import { Program, createProgram } from "../service/program";
import { SettingsService, createSettingsService } from "../service/settings";

type Props = {
  readonly initialContent: string;
  readonly children: React.ReactNode;
};

const settingsCtx = createContext<SettingsService>(null as any);
const SettingsProviderInner = settingsCtx.Provider;
const programCtx = createContext<Program>(null as any);
const ProgramProviderInner = programCtx.Provider;

export function ProgramProvider({ initialContent, children }: Props) {
  const settingsService = createSettingsService();
  return (
    <SettingsProviderInner value={settingsService}>
      <ProgramProviderInner value={createProgram({ initialContent, settingsService })}>{children}</ProgramProviderInner>
    </SettingsProviderInner>
  );
}

export const programContext = programCtx;
export const settingsContext = settingsCtx;
