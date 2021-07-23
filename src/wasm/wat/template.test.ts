import * as f from "../ast-factory";
import { template } from "./template";
import { InstructionNode } from "../ast-types";

describe("Template functions", () => {
  describe(template.instructions, () => {
    test("generate", () => {
      const fn = template.instructions`i32.const 1`;
      expect(fn()).toMatchObject<InstructionNode[]>([f.int32NumericInstr("i32.const", [f.int32(1)])]);
    });

    test("with object placeholder", () => {
      const fn = template.instructions`
        i32.const 1
        ${() => f.int32NumericInstr("i32.const", [f.int32(2)])}
      `;
      expect(fn()).toMatchObject<InstructionNode[]>([
        f.int32NumericInstr("i32.const", [f.int32(1)]),
        f.int32NumericInstr("i32.const", [f.int32(2)]),
      ]);
    });

    test("with array placeholder", () => {
      const fn = template.instructions`
        ${() => [f.int32NumericInstr("i32.const", [f.int32(2)]), f.int32NumericInstr("i32.const", [f.int32(2)])]}
        i32.mul
      `;
      expect(fn()).toMatchObject<InstructionNode[]>([
        f.int32NumericInstr("i32.const", [f.int32(2)]),
        f.int32NumericInstr("i32.const", [f.int32(2)]),
        f.int32NumericInstr("i32.mul", []),
      ]);
    });
  });

  describe(template.moduleFields, () => {
    test("generate", () => {
      expect(
        template.moduleFields`
          ${() => f.memory(f.limits(f.uint32(1)))}
          (func (param i32) (result i32)
            i32.const 1
          )
      `(),
      ).toMatchObject([
        f.memory(f.limits(f.uint32(1))),
        f.func(
          f.funcSig([f.paramType(f.valueType("i32"))], [f.valueType("i32")]),
          [],
          [f.int32NumericInstr("i32.const", [f.int32(1)])],
        ),
      ]);
    });
  });
});
