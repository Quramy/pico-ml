export const structuredInstructions = {
  block: { code: 0x02 },
  loop: { code: 0x03 },
  if: { code: 0x04 },
  else: { code: 0x05 },
  end: { code: 0x0b },
} as const;

export const controlInstructions = {
  unreachable: { code: 0x00, args: [] },
  nop: { code: 0x01, args: [] },
  br: { code: 0x0c, args: ["labels"] },
  br_if: { code: 0x0d, args: ["labels"] },
  return: { code: 0x0f, args: [] },
  call: { code: 0x10, args: ["funcs"] },
  call_indirect: { code: 0x11, args: ["types", "tables"] },
} as const;

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

export const memoryInstructions = {
  "i32.load": { code: 0x28, defaultAlign: 1 },
  "i32.load8_s": { code: 0x2c, defaultAlign: 1 },
  "i32.load8_u": { code: 0x2d, defaultAlign: 1 },
  "i32.store": { code: 0x36, defaultAlign: 1 },
  "i32.store8": { code: 0x3a, defaultAlign: 1 },
  "i32.store16": { code: 0x3b, defaultAlign: 1 },
} as const;

export type ControlInstructionKind = keyof typeof controlInstructions;
export type ControlInstructionParamKind = typeof controlInstructions[ControlInstructionKind]["args"][number];

export type VariableInstructionKind = keyof typeof variableInstructions;
export type VariableInstructionParamKind = typeof variableInstructions[VariableInstructionKind]["args"][number];

export type NumericInstructionKind = keyof typeof numericInstructions;
export type NumericInstructionParamKind = typeof numericInstructions[NumericInstructionKind]["args"][number];

export type MemoryInstructionKind = keyof typeof memoryInstructions;

export const getControlInstructionKinds = () => Object.keys(controlInstructions) as readonly ControlInstructionKind[];
export const getVariableInstructionKinds = () =>
  Object.keys(variableInstructions) as readonly VariableInstructionKind[];
export const getNumericInstructionKinds = () => Object.keys(numericInstructions) as readonly NumericInstructionKind[];

export const getMemoryInstructionKinds = () => Object.keys(memoryInstructions) as readonly MemoryInstructionKind[];
