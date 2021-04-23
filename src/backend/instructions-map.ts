export const variableInstructions = {
  "local.get": { code: 0x20, args: ["locals"] },
  "local.set": { code: 0x21, args: ["locals"] },
  "local.tee": { code: 0x22, args: ["locals"] },
  "global.get": { code: 0x23, args: ["globals"] },
  "global.set": { code: 0x24, args: ["globals"] },
} as const;

export const numericInstructions = {
  "i32.const": { code: 0x41, args: ["SignedInteger"] },

  "i32.eqz": { code: 0x45, args: [] },
  "i32.eq": { code: 0x46, args: [] },
  "i32.ne": { code: 0x47, args: [] },
  "i32.lt_s": { code: 0x48, args: [] },
  "i32.lt_u": { code: 0x49, args: [] },
  "i32.gt_s": { code: 0x4a, args: [] },
  "i32.gt_u": { code: 0x4b, args: [] },
  "i32.le_s": { code: 0x4c, args: [] },
  "i32.le_u": { code: 0x4d, args: [] },
  "i32.ge_s": { code: 0x4e, args: [] },
  "i32.ge_u": { code: 0x4f, args: [] },

  "i32.clz": { code: 0x67, args: [] },
  "i32.ctz": { code: 0x68, args: [] },
  "i32.popcnt": { code: 0x69, args: [] },
  "i32.add": { code: 0x6a, args: [] },
  "i32.sub": { code: 0x6b, args: [] },
  "i32.mul": { code: 0x6c, args: [] },
  "i32.div_s": { code: 0x6d, args: [] },
  "i32.div_u": { code: 0x6e, args: [] },
  "i32.rem_s": { code: 0x6f, args: [] },
  "i32.rem_u": { code: 0x70, args: [] },
  "i32.and": { code: 0x71, args: [] },
  "i32.or": { code: 0x72, args: [] },
  "i32.xor": { code: 0x73, args: [] },
  "i32.shl": { code: 0x74, args: [] },
  "i32.shr_s": { code: 0x75, args: [] },
  "i32.shr_u": { code: 0x76, args: [] },
  "i32.rotl": { code: 0x77, args: [] },
  "i32.rotr": { code: 0x78, args: [] },
} as const;

export type VariableInstructionKind = keyof typeof variableInstructions;
export type VariableInstructionParamKind = typeof variableInstructions[VariableInstructionKind]["args"][number];

export type NumericInstructionKind = keyof typeof numericInstructions;
export type NumericInstructionParamKind = typeof numericInstructions[NumericInstructionKind]["args"][number];

export const getVariableInstructionKinds = () =>
  Object.keys(variableInstructions) as readonly VariableInstructionKind[];
export const getNumericInstructionKinds = () => Object.keys(numericInstructions) as readonly NumericInstructionKind[];
