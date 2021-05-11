import React, { createContext } from "react";
import { Program, createProgram } from "../service/program";

type Props = {
  readonly initialContent: string;
  readonly children: React.ReactNode;
};

const context = createContext<Program>(null as any);
const Provider = context.Provider;

export function ProgramProvider({ initialContent, children }: Props) {
  return <Provider value={createProgram({ initialContent })}>{children}</Provider>;
}

export const programContext = context;
