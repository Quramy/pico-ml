import { mapValue, ok, error } from "../../structure";

import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";
import { getFloatValueInstr, storeFloatValueInstr } from "../assets/modules/float";
import { compareInstr, intCompareInstr, floatCompareInstr, ComparisonOperators } from "../assets/modules/comparator";

export const binaryExpression: CompileNodeFn<"BinaryExpression"> = (node, ctx, next) => {
  const { typeValueMap, dispatchUsingInferredType } = ctx.getOptions();
  const lType = node.left._nodeId ? typeValueMap.get(node.left._nodeId) : undefined;
  const rType = node.right._nodeId ? typeValueMap.get(node.right._nodeId) : undefined;
  const isOperandInferredInt =
    !!dispatchUsingInferredType &&
    (lType?.kind === "Bool" || lType?.kind === "Int" || rType?.kind === "Bool" || rType?.kind === "Int");
  const isOperandInferredFloat = !!dispatchUsingInferredType && (lType?.kind === "Float" || rType?.kind === "Float");
  return mapValue(
    next(node.left, ctx),
    next(node.right, ctx),
  )((left, right) => {
    const dispatchCompareInstr = (op: ComparisonOperators) => {
      if (isOperandInferredInt) {
        return ok([...left, ...right, ...intCompareInstr(op)]);
      } else if (isOperandInferredFloat) {
        ctx.useFloat();
        return ok([...left, ...getFloatValueInstr(), ...right, ...getFloatValueInstr(), ...floatCompareInstr(op)]);
      } else {
        ctx.useComparator(op);
        return ok([...left, ...right, ...compareInstr(op)]);
      }
    };
    switch (node.op.kind) {
      case "Add":
        // 2(a + b) + 1 = (2a + 1) + (2b + 1) - 1 = A + B - 1
        return ok([
          ...left,
          ...right,
          factory.int32NumericInstr("i32.add", []),
          factory.int32NumericInstr("i32.const", [factory.int32(1)]),
          factory.int32NumericInstr("i32.sub", []),
        ]);
      case "Sub":
        // 2(a - b) + 1 = (2a + 1) - (2b + 1) + 1 = A - B + 1
        return ok([
          ...left,
          ...right,
          factory.int32NumericInstr("i32.sub", []),
          factory.int32NumericInstr("i32.const", [factory.int32(1)]),
          factory.int32NumericInstr("i32.add", []),
        ]);
      case "Multiply": {
        // 2ab + 1 = (2a + 1 - 1) * b  + 1 = (A - 1) * (B >> 1) + 1
        return ok([
          ...left,
          factory.int32NumericInstr("i32.const", [factory.int32(1)]),
          factory.int32NumericInstr("i32.sub", []),
          ...right,
          factory.int32NumericInstr("i32.const", [factory.int32(1)]),
          factory.int32NumericInstr("i32.shr_s", []),
          factory.int32NumericInstr("i32.mul", []),
          factory.int32NumericInstr("i32.const", [factory.int32(1)]),
          factory.int32NumericInstr("i32.add", []),
        ]);
      }
      case "Div":
        return ok([
          ...left,
          factory.int32NumericInstr("i32.const", [factory.int32(1)]),
          factory.int32NumericInstr("i32.shr_s"),
          ...right,
          factory.int32NumericInstr("i32.const", [factory.int32(1)]),
          factory.int32NumericInstr("i32.shr_s"),
          factory.int32NumericInstr("i32.div_s"),
          factory.int32NumericInstr("i32.const", [factory.int32(1)]),
          factory.int32NumericInstr("i32.shl"),
          factory.int32NumericInstr("i32.const", [factory.int32(1)]),
          factory.int32NumericInstr("i32.or"),
        ]);
      case "Or":
        return ok([...left, ...right, factory.int32NumericInstr("i32.or", [])]);
      case "And":
        return ok([...left, ...right, factory.int32NumericInstr("i32.and", [])]);
      case "LessThan":
        return dispatchCompareInstr("lt");
      case "LessEqualThan":
        return dispatchCompareInstr("le");
      case "GreaterThan":
        return dispatchCompareInstr("gt");
      case "GreaterEqualThan":
        return dispatchCompareInstr("ge");
      case "Equal":
        return dispatchCompareInstr("eq");
      case "NotEqual":
        return dispatchCompareInstr("ne");
      case "PEqual":
        return ok([...left, ...right, factory.int32NumericInstr("i32.eq", [])]);
      case "PNotEqual":
        return ok([...left, ...right, factory.int32NumericInstr("i32.ne", [])]);
      case "FAdd": {
        ctx.useFloat();
        return ok([
          ...left,
          ...getFloatValueInstr(),
          ...right,
          ...getFloatValueInstr(),
          factory.float64NumericInstr("f64.add", []),
          ...storeFloatValueInstr(),
        ]);
      }
      case "FSub": {
        ctx.useFloat();
        return ok([
          ...left,
          ...getFloatValueInstr(),
          ...right,
          ...getFloatValueInstr(),
          factory.float64NumericInstr("f64.sub", []),
          ...storeFloatValueInstr(),
        ]);
      }
      case "FMultiply": {
        ctx.useFloat();
        return ok([
          ...left,
          ...getFloatValueInstr(),
          ...right,
          ...getFloatValueInstr(),
          factory.float64NumericInstr("f64.mul", []),
          ...storeFloatValueInstr(),
        ]);
      }
      case "FDiv": {
        ctx.useFloat();
        return ok([
          ...left,
          ...getFloatValueInstr(),
          ...right,
          ...getFloatValueInstr(),
          factory.float64NumericInstr("f64.div", []),
          ...storeFloatValueInstr(),
        ]);
      }
      default:
        // @ts-expect-error
        return error({ message: `invalid kind: ${node.op.kind}` });
    }
  }).error(err => ({ ...err, occurence: node }));
};
