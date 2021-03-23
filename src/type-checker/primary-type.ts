import { ExpressionNode } from "../parser";
import {
  TypeEnvironment,
  TypeValue,
  TypeParameterType,
  PrimaryTypeFailure,
  PrimaryTypeResult,
  PrimaryTypeValue,
  TypeSubstitution,
  TypeEquation,
  TypeScheme,
  ListType,
} from "./types";
import { createRootEnvironment, createChildEnvironment } from "./type-environment";
import { unify } from "./unify";
import { substituteType, substituteEnv } from "./substitute";
import { getClosure } from "./ftv";

function ok(type: TypeValue, substitutions: readonly TypeSubstitution[] = [] as const): PrimaryTypeResult {
  return {
    ok: true,
    value: {
      expressionType: type,
      substitutions,
    },
  };
}

function error(failure: PrimaryTypeFailure): PrimaryTypeResult {
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

function mapValues(...resuls: PrimaryTypeResult[]) {
  return (cb: (...values: PrimaryTypeValue[]) => PrimaryTypeResult) => {
    const values: PrimaryTypeValue[] = [];
    for (const r of resuls) {
      if (!r.ok) return r;
      values.push(r.value);
    }
    return cb(...values);
  };
}

function toEquationSet(...values: { substitutions: readonly TypeSubstitution[] }[]): TypeEquation[] {
  return values.reduce(
    (acc, { substitutions }) => [
      ...acc,
      ...substitutions.map(({ from, to }) => ({
        lhs: from,
        rhs: to,
      })),
    ],
    [] as TypeEquation[],
  );
}

function schemeFromType(type: TypeValue): TypeScheme {
  return {
    kind: "TypeScheme",
    type,
    variables: [],
  };
}

function pt(expression: ExpressionNode, ctx: Context): PrimaryTypeResult {
  if (expression.kind === "NumberLiteral") {
    return ok({ kind: "Int" });
  } else if (expression.kind === "BoolLiteral") {
    return ok({ kind: "Bool" });
  } else if (expression.kind === "EmptyList") {
    const elementType = ctx.generator.gen();
    return ok({ kind: "List", elementType });
  } else if (expression.kind === "Identifier") {
    const typeScheme = ctx.env.get(expression);
    if (!typeScheme) {
      return error({
        message: `No identifier ${expression.name}`,
      });
    }
    const substituions: TypeSubstitution[] = typeScheme.variables.map(v => ({
      from: v,
      to: ctx.generator.gen(),
    }));
    return ok(substituteType(typeScheme.type, ...substituions));
  } else if (expression.kind === "BinaryExpression") {
    switch (expression.op.kind) {
      case "Add":
      case "Sub":
      case "Multiply":
      case "LessThan":
        return mapValues(
          pt(expression.left, ctx),
          pt(expression.right, ctx),
        )((left, right) => {
          const unified = unify([
            ...toEquationSet(left, right),
            {
              lhs: left.expressionType,
              rhs: { kind: "Int" },
            },
            {
              lhs: right.expressionType,
              rhs: { kind: "Int" },
            },
          ]);
          if (!unified.ok) return error(unified.value);
          return ok(
            {
              kind: expression.op.kind === "LessThan" ? "Bool" : "Int",
            },
            unified.value,
          );
        });
      default:
        // @ts-expect-error
        throw new Error(`invalid operation ${expression.op.kind}`);
    }
  } else if (expression.kind === "ListConstructor") {
    return mapValues(
      pt(expression.head, ctx),
      pt(expression.tail, ctx),
    )((head, tail) => {
      const unified = unify([
        ...toEquationSet(head, tail),
        {
          lhs: tail.expressionType,
          rhs: {
            kind: "List",
            elementType: head.expressionType,
          },
        },
      ]);
      if (!unified.ok) return error(unified.value);
      return ok(substituteType(tail.expressionType, ...unified.value), unified.value);
    });
  } else if (expression.kind === "IfExpression") {
    return mapValues(
      pt(expression.cond, ctx),
      pt(expression.then, ctx),
      pt(expression.else, ctx),
    )((cond, thenVal, elseVal) => {
      const unified = unify([
        ...toEquationSet(cond, thenVal, elseVal),
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
      ]);
      if (!unified.ok) return error(unified.value);
      return ok(substituteType(thenVal.expressionType, ...unified.value), unified.value);
    });
  } else if (expression.kind === "MatchExpression") {
    return mapValues(
      pt(expression.exp, ctx),
      pt(expression.emptyClause, ctx),
    )((exp, emptyClause) => {
      const elementType = ctx.generator.gen();
      const listType: ListType = {
        kind: "List",
        elementType,
      };
      const childEnv = createChildEnvironment(
        expression.rightIdentifier,
        schemeFromType(listType),
        createChildEnvironment(expression.leftIdentifier, schemeFromType(elementType), ctx.env),
      );
      return mapValues(pt(expression.consClause, { ...ctx, env: childEnv }))(consClause => {
        const unified = unify([
          ...toEquationSet(exp, emptyClause, consClause),
          { lhs: exp.expressionType, rhs: listType },
          { lhs: emptyClause.expressionType, rhs: consClause.expressionType },
        ]);
        if (!unified.ok) return error(unified.value);
        return ok(substituteType(emptyClause.expressionType, ...unified.value), unified.value);
      });
    });
  } else if (expression.kind === "LetExpression") {
    return mapValues(pt(expression.binding, ctx))(binding => {
      const scheme = getClosure(binding.expressionType, substituteEnv(ctx.env, ...binding.substitutions));
      const env = createChildEnvironment(expression.identifier, scheme, ctx.env);
      return mapValues(pt(expression.exp, { ...ctx, env }))(exp => {
        const unified = unify(toEquationSet(binding, exp));
        if (!unified.ok) return error(unified.value);
        return ok(substituteType(exp.expressionType, ...unified.value), unified.value);
      });
    });
  } else if (expression.kind === "LetRecExpression") {
    const funcType = ctx.generator.gen();
    const paramType = ctx.generator.gen();
    const bodyEnv = createChildEnvironment(
      expression.binding.param,
      schemeFromType(paramType),
      createChildEnvironment(expression.identifier, schemeFromType(funcType), ctx.env),
    );
    return mapValues(pt(expression.binding.body, { ...ctx, env: bodyEnv }))(bindingBody => {
      const unifiedBody = unify([
        ...toEquationSet(bindingBody),
        {
          lhs: funcType,
          rhs: {
            kind: "Function",
            paramType,
            returnType: bindingBody.expressionType,
          },
        },
      ]);
      if (!unifiedBody.ok) return error(unifiedBody.value);
      const scheme = getClosure(
        substituteType(funcType, ...unifiedBody.value),
        substituteEnv(ctx.env, ...unifiedBody.value),
      );
      const childEnv = createChildEnvironment(expression.identifier, scheme, ctx.env);
      return mapValues(pt(expression.exp, { ...ctx, env: childEnv }))(exp => {
        const unifiedExp = unify(toEquationSet({ substitutions: unifiedBody.value }, exp));
        if (!unifiedExp.ok) return error(unifiedExp.value);
        return ok(substituteType(exp.expressionType, ...unifiedExp.value), unifiedExp.value);
      });
    });
  } else if (expression.kind === "FunctionDefinition") {
    const paramType = ctx.generator.gen();
    const env = createChildEnvironment(expression.param, schemeFromType(paramType), ctx.env);
    return mapValues(pt(expression.body, { ...ctx, env }))(body => {
      return ok(
        substituteType(
          {
            kind: "Function",
            paramType,
            returnType: body.expressionType,
          },
          ...body.substitutions,
        ),
        body.substitutions,
      );
    });
  } else if (expression.kind === "FunctionApplication") {
    return mapValues(
      pt(expression.callee, ctx),
      pt(expression.argument, ctx),
    )((callee, argument) => {
      const returnType = ctx.generator.gen();
      const unified = unify([
        ...toEquationSet(callee, argument),
        {
          lhs: callee.expressionType,
          rhs: {
            kind: "Function",
            paramType: argument.expressionType,
            returnType,
          },
        },
      ]);
      if (!unified.ok) return error(unified.value);
      return ok(substituteType(returnType, ...unified.value), unified.value);
    });
  }

  // @ts-expect-error
  throw new Error(`Unreachable code: ${expression.kind}`);
}

export function getPrimaryType(expression: ExpressionNode) {
  return pt(expression, {
    generator: new ParmGenerator(),
    env: createRootEnvironment(),
  });
}
