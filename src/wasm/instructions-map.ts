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
  call_indirect: { code: 0x11, args: ["tables", "types"] },
} as const;

export const variableInstructions = {
  "local.get": { code: 0x20, args: ["locals"] },
  "local.set": { code: 0x21, args: ["locals"] },
  "local.tee": { code: 0x22, args: ["locals"] },
  "global.get": { code: 0x23, args: ["globals"] },
  "global.set": { code: 0x24, args: ["globals"] },
} as const;

export const i32NumberInstructions = {
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

export const i64NumberInstructions = {
  "i64.const": { code: 0x42, args: ["DoubleSignedInteger"] },

  "i64.eqz": { code: 0x50, args: [] },
  "i64.eq": { code: 0x51, args: [] },
  "i64.ne": { code: 0x52, args: [] },
  "i64.lt_s": { code: 0x53, args: [] },
  "i64.lt_u": { code: 0x54, args: [] },
  "i64.gt_s": { code: 0x55, args: [] },
  "i64.gt_u": { code: 0x56, args: [] },
  "i64.le_s": { code: 0x57, args: [] },
  "i64.le_u": { code: 0x58, args: [] },
  "i64.ge_s": { code: 0x59, args: [] },
  "i64.ge_u": { code: 0x5a, args: [] },

  "i64.clz": { code: 0x79, args: [] },
  "i64.ctz": { code: 0x7a, args: [] },
  "i64.popcnt": { code: 0x7b, args: [] },
  "i64.add": { code: 0x7c, args: [] },
  "i64.sub": { code: 0x7d, args: [] },
  "i64.mul": { code: 0x7e, args: [] },
  "i64.div_s": { code: 0x7f, args: [] },
  "i64.div_u": { code: 0x80, args: [] },
  "i64.rem_s": { code: 0x81, args: [] },
  "i64.rem_u": { code: 0x82, args: [] },
  "i64.and": { code: 0x83, args: [] },
  "i64.or": { code: 0x84, args: [] },
  "i64.xor": { code: 0x85, args: [] },
  "i64.shl": { code: 0x86, args: [] },
  "i64.shr_s": { code: 0x87, args: [] },
  "i64.shr_u": { code: 0x88, args: [] },
  "i64.rotl": { code: 0x89, args: [] },
  "i64.rotr": { code: 0x8a, args: [] },
} as const;

export const f32NumberInstructions = {
  "f32.const": { code: 0x43, args: ["SignedFloat"] },

  "f32.eq": { code: 0x5b, args: [] },
  "f32.ne": { code: 0x5c, args: [] },
  "f32.lt": { code: 0x5d, args: [] },
  "f32.gt": { code: 0x5e, args: [] },
  "f32.le": { code: 0x5f, args: [] },
  "f32.ge": { code: 0x60, args: [] },

  "f32.abs": { code: 0x8b, args: [] },
  "f32.neg": { code: 0x8c, args: [] },
  "f32.ceil": { code: 0x8e, args: [] },
  "f32.floor": { code: 0x8d, args: [] },
  "f32.trunc": { code: 0x8f, args: [] },
  "f32.nearest": { code: 0x90, args: [] },
  "f32.sqrt": { code: 0x91, args: [] },
  "f32.add": { code: 0x92, args: [] },
  "f32.sub": { code: 0x93, args: [] },
  "f32.mul": { code: 0x94, args: [] },
  "f32.div": { code: 0x95, args: [] },
  "f32.min": { code: 0x96, args: [] },
  "f32.max": { code: 0x97, args: [] },
  "f32.copysign": { code: 0x98, args: [] },
} as const;

export const f64NumberInstructions = {
  "f64.const": { code: 0x44, args: ["DoubleSignedFloat"] },

  "f64.eq": { code: 0x61, args: [] },
  "f64.ne": { code: 0x62, args: [] },
  "f64.lt": { code: 0x63, args: [] },
  "f64.gt": { code: 0x64, args: [] },
  "f64.le": { code: 0x65, args: [] },
  "f64.ge": { code: 0x66, args: [] },

  "f64.abs": { code: 0x99, args: [] },
  "f64.neg": { code: 0x9a, args: [] },
  "f64.ceil": { code: 0x9b, args: [] },
  "f64.floor": { code: 0x9c, args: [] },
  "f64.trunc": { code: 0x9d, args: [] },
  "f64.nearest": { code: 0x9e, args: [] },
  "f64.sqrt": { code: 0x9f, args: [] },
  "f64.add": { code: 0xa0, args: [] },
  "f64.sub": { code: 0xa1, args: [] },
  "f64.mul": { code: 0xa2, args: [] },
  "f64.div": { code: 0xa3, args: [] },
  "f64.min": { code: 0xa4, args: [] },
  "f64.max": { code: 0xa5, args: [] },
  "f64.copysign": { code: 0xa6, args: [] },
} as const;

export const memoryInstructions = {
  "i32.load": { code: 0x28, defaultAlign: 2 },
  "i32.load8_s": { code: 0x2c, defaultAlign: 0 },
  "i32.load8_u": { code: 0x2d, defaultAlign: 0 },
  "i32.store": { code: 0x36, defaultAlign: 2 },
  "i32.store8": { code: 0x3a, defaultAlign: 0 },
  "i32.store16": { code: 0x3b, defaultAlign: 0 },
} as const;

export const numberInstructions = {
  ...i32NumberInstructions,
  ...i64NumberInstructions,
  ...f32NumberInstructions,
  ...f64NumberInstructions,
} as const;

export type ControlInstructionKind = keyof typeof controlInstructions;
export type ControlInstructionParamKind = typeof controlInstructions[ControlInstructionKind]["args"][number];

export type VariableInstructionKind = keyof typeof variableInstructions;
export type VariableInstructionParamKind = typeof variableInstructions[VariableInstructionKind]["args"][number];

export type Int32NumericInstructionKind = keyof typeof i32NumberInstructions;
export type Int32NumericInstructionParamKind =
  typeof i32NumberInstructions[Int32NumericInstructionKind]["args"][number];

export type Int64NumericInstructionKind = keyof typeof i64NumberInstructions;
export type Int64NumericInstructionParamKind =
  typeof i64NumberInstructions[Int64NumericInstructionKind]["args"][number];

export type Float32NumericInstructionKind = keyof typeof f32NumberInstructions;
export type Float32NumericInstructionParamKind =
  typeof f32NumberInstructions[Float32NumericInstructionKind]["args"][number];

export type Float64NumericInstructionKind = keyof typeof f64NumberInstructions;
export type Float64NumericInstructionParamKind =
  typeof f64NumberInstructions[Float64NumericInstructionKind]["args"][number];

export type NumericInstructionKind =
  | Int32NumericInstructionKind
  | Int64NumericInstructionKind
  | Float32NumericInstructionKind
  | Float64NumericInstructionKind;

export type MemoryInstructionKind = keyof typeof memoryInstructions;

export const getControlInstructionKinds = () => Object.keys(controlInstructions) as readonly ControlInstructionKind[];

export const getVariableInstructionKinds = () =>
  Object.keys(variableInstructions) as readonly VariableInstructionKind[];

export const getInt32NumericInstructionKinds = () =>
  Object.keys(i32NumberInstructions) as readonly Int32NumericInstructionKind[];

export const getInt64NumericInstructionKinds = () =>
  Object.keys(i64NumberInstructions) as readonly Int64NumericInstructionKind[];

export const getFloat32NumericInstructionKinds = () =>
  Object.keys(f32NumberInstructions) as readonly Float32NumericInstructionKind[];

export const getFloat64NumericInstructionKinds = () =>
  Object.keys(f64NumberInstructions) as readonly Float64NumericInstructionKind[];

export const getMemoryInstructionKinds = () => Object.keys(memoryInstructions) as readonly MemoryInstructionKind[];
