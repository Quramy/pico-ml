import { ExpressionNode } from "../parser";
import {
  TypeEnvironment,
  ExtractedResult,
  TypeValue,
  TypeEquation,
  ExtractedFailure,
  ExtractedValue,
  TypeParameterType,
} from "./types";
import { createRootEnvironment, createChildEnvironment } from "./type-environment";

function ok(type: TypeValue, equationSet: readonly TypeEquation[] = [] as const): ExtractedResult {
  return {
    ok: true,
    value: {
      expressionType: type,
      equationSet,
    },
  };
}

function error(failure: ExtractedFailure): ExtractedResult {
  return {
    ok: false,
    value: failure,
  };
}

class ParmGenerator {
  private idx = 0;
  gen() {
    const id = this.idx++;
    const paramType: TypeParameterType = {
      kind: "TypeParameter",
      id,
    };
    return paramType;
  }
}

type Context = {
  readonly generator: ParmGenerator;
  readonly env: TypeEnvironment;
};

function mapValues(...resuls: ExtractedResult[]) {
  return (cb: (...values: ExtractedValue[]) => ExtractedResult) => {
    const values: ExtractedValue[] = [];
    for (const r of resuls) {
      if (!r.ok) return r;
      values.push(r.value);
    }
    return cb(...values);
  };
}

function extractWithEnv(expression: ExpressionNode, ctx: Context): ExtractedResult {
  if (expression.kind === "NumberLiteral") {
    return ok({ kind: "Int" });
  } else if (expression.kind === "BoolLiteral") {
    return ok({ kind: "Bool" });
  } else if (expression.kind === "EmptyList") {
    const elementType = ctx.generator.gen();
    return ok({ kind: "List", elementType });
  } else if (expression.kind === "Identifier") {
    const typeValue = ctx.env.get(expression);
    if (!typeValue) {
      return error({
        message: `No identifier ${expression.name}`,
      });
    }
    return ok(typeValue);
  } else if (expression.kind === "BinaryExpression") {
    switch (expression.op.kind) {
      case "Add":
      case "Sub":
      case "Multiply":
      case "LessThan":
        return mapValues(
          extractWithEnv(expression.left, ctx),
          extractWithEnv(expression.right, ctx),
        )((left, right) =>
          ok(
            {
              kind: expression.op.kind === "LessThan" ? "Bool" : "Int",
            },
            [
              ...left.equationSet,
              ...right.equationSet,
              {
                lhs: left.expressionType,
                rhs: { kind: "Int" },
              },
              {
                lhs: right.expressionType,
                rhs: { kind: "Int" },
              },
            ],
          ),
        );
      case "Cons": {
        return mapValues(
          extractWithEnv(expression.left, ctx),
          extractWithEnv(expression.right, ctx),
        )((head, rest) =>
          ok(rest.expressionType, [
            ...head.equationSet,
            ...rest.equationSet,
            {
              lhs: rest.expressionType,
              rhs: {
                kind: "List",
                elementType: head.expressionType,
              },
            },
          ]),
        );
      }
      default:
        throw new Error("invalid operation");
    }
  } else if (expression.kind === "IfExpression") {
    return mapValues(
      extractWithEnv(expression.cond, ctx),
      extractWithEnv(expression.then, ctx),
      extractWithEnv(expression.else, ctx),
    )((cond, thenVal, elseVal) =>
      ok(thenVal.expressionType, [
        ...cond.equationSet,
        ...thenVal.equationSet,
        ...elseVal.equationSet,
        {
          lhs: cond.expressionType,
          rhs: {
            kind: "Bool",
          },
        },
        {
          lhs: thenVal.expressionType,
          rhs: elseVal.expressionType,
        },
      ]),
    );
  } else if (expression.kind === "LetExpression") {
    return mapValues(extractWithEnv(expression.binding, ctx))(binding => {
      const env = createChildEnvironment(expression.identifier, binding.expressionType, ctx.env);
      return mapValues(extractWithEnv(expression.exp, { ...ctx, env }))(exp =>
        ok(exp.expressionType, [...binding.equationSet, ...exp.equationSet]),
      );
    });
  } else if (expression.kind === "FunctionDefinition") {
    const paramType = ctx.generator.gen();
    const env = createChildEnvironment(expression.param, paramType, ctx.env);
    return mapValues(extractWithEnv(expression.body, { ...ctx, env }))(body =>
      ok(
        {
          kind: "Function",
          paramType,
          returnType: body.expressionType,
        },
        body.equationSet,
      ),
    );
  } else if (expression.kind === "FunctionApplication") {
    return mapValues(
      extractWithEnv(expression.callee, ctx),
      extractWithEnv(expression.argument, ctx),
    )((callee, argument) => {
      const returnType = ctx.generator.gen();
      return ok(returnType, [
        ...callee.equationSet,
        ...argument.equationSet,
        {
          lhs: callee.expressionType,
          rhs: {
            kind: "Function",
            paramType: argument.expressionType,
            returnType,
          },
        },
      ]);
    });
  }

  throw new Error(`Invalid node: ${expression.kind}`);
}

export function extract(expression: ExpressionNode) {
  return extractWithEnv(expression, {
    generator: new ParmGenerator(),
    env: createRootEnvironment(),
  });
}
