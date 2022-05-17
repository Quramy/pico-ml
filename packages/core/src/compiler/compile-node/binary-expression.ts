import { mapValue, ok, error } from "../../structure";

import { ComparisonOperations, FArithmericOperations } from "../../syntax";
import { CompileNodeFn } from "../types";
import { wat, factory } from "../../wasm";
import { getFloatValueInstr, storeFloatValueInstr } from "../assets/modules/float";
import { compareInstr, intCompareInstr, floatCompareInstr, ComparisonOperators } from "../assets/modules/comparator";

const COMAPARISON_OP_MAP: Record<Exclude<ComparisonOperations["kind"], "PEqual" | "PNotEqual">, ComparisonOperators> = {
  LessThan: "lt",
  LessEqualThan: "le",
  GreaterThan: "gt",
  GreaterEqualThan: "ge",
  Equal: "eq",
  NotEqual: "ne",
};

const FARITHMETIC_OP_MAP: Record<FArithmericOperations["kind"], "add" | "sub" | "mul" | "div"> = {
  FAdd: "add",
  FSub: "sub",
  FMultiply: "mul",
  FDiv: "div",
};

export const binaryExpression: CompileNodeFn<"BinaryExpression"> = (node, ctx, next) =>
  mapValue(
    next(node.left, ctx),
    next(node.right, ctx),
  )((left, right) => {
    switch (node.op.kind) {
      case "Add":
        // 2(a + b) + 1 = (2a + 1) + (2b + 1) - 1 = A + B - 1
        return ok(
          wat.instructions`
            ${() => left}
            ${() => right}
            i32.add
            i32.const 1
            i32.sub
          `(),
        );
      case "Sub":
        // 2(a - b) + 1 = (2a + 1) - (2b + 1) + 1 = A - B + 1
        return ok(
          wat.instructions`
            ${() => left}
            ${() => right}
            i32.sub
            i32.const 1
            i32.add
          `(),
        );
      case "Multiply": {
        // 2ab + 1 = (2a + 1 - 1) * b  + 1 = (A - 1) * (B >> 1) + 1
        return ok(
          wat.instructions`
            ${() => left}
            i32.const 1
            i32.sub
            ${() => right}
            i32.const 1
            i32.shr_s
            i32.mul
            i32.const 1
            i32.add
          `(),
        );
      }
      case "Div":
        return ok(
          wat.instructions`
          ${() => left}
          i32.const 1
          i32.shr_s
          
          ${() => right}
          i32.const 1
          i32.shr_s

          i32.div_s
          i32.const 1
          i32.shl
          i32.const 1
          i32.or
        `(),
        );
      case "Or":
        return ok([...left, ...right, factory.int32NumericInstr("i32.or", [])]);
      case "And":
        return ok([...left, ...right, factory.int32NumericInstr("i32.and", [])]);
      case "LessThan":
      case "LessEqualThan":
      case "GreaterThan":
      case "GreaterEqualThan":
      case "Equal":
      case "NotEqual": {
        const { typeValueMap, dispatchUsingInferredType } = ctx.getOptions();
        const lType = node.left._nodeId ? typeValueMap.get(node.left._nodeId) : undefined;
        const rType = node.right._nodeId ? typeValueMap.get(node.right._nodeId) : undefined;
        const isOperandInferredInt =
          !!dispatchUsingInferredType &&
          (lType?.kind === "Bool" || lType?.kind === "Int" || rType?.kind === "Bool" || rType?.kind === "Int");
        const isOperandInferredFloat =
          !!dispatchUsingInferredType && (lType?.kind === "Float" || rType?.kind === "Float");
        const op = COMAPARISON_OP_MAP[node.op.kind];
        if (isOperandInferredInt) {
          return ok([...left, ...right, ...intCompareInstr(op)]);
        } else if (isOperandInferredFloat) {
          ctx.useFloat();
          return ok([...left, ...getFloatValueInstr(), ...right, ...getFloatValueInstr(), ...floatCompareInstr(op)]);
        } else {
          ctx.useComparator(op);
          return ok([...left, ...right, ...compareInstr(op)]);
        }
      }
      case "PEqual":
        return ok([...left, ...right, factory.int32NumericInstr("i32.eq", [])]);
      case "PNotEqual":
        return ok([...left, ...right, factory.int32NumericInstr("i32.ne", [])]);
      case "FAdd":
      case "FSub":
      case "FMultiply":
      case "FDiv": {
        ctx.useFloat();
        return ok(
          wat.instructions`
            ${() => left}
            ${getFloatValueInstr}
            ${() => right}
            ${getFloatValueInstr}
            f64.${FARITHMETIC_OP_MAP[node.op.kind]}
            ${storeFloatValueInstr}
          `(),
        );
      }
      default:
        // @ts-expect-error
        return error({ message: `invalid kind: ${node.op.kind}` });
    }
  }).error(err => ({ ...err, occurence: node }));
