import { mapValue, useResult } from "../structure";
import { ExpressionNode } from "../parser";
import {
  TypeEnvironment,
  TypeValue,
  TypeParameterType,
  PrimaryTypeResult,
  TypeSubstitution,
  TypeEquation,
  TypeScheme,
  ListType,
} from "./types";
import { createRootEnvironment, createChildEnvironment } from "./type-environment";
import { unify } from "./unify";
import { substituteType, substituteEnv } from "./substitute";
import { getClosure } from "./ftv";

const { ok, error } = useResult<PrimaryTypeResult>();

const primaryType = (type: TypeValue, substitutions: readonly TypeSubstitution[] = [] as const) =>
  ok({
    expressionType: type,
    substitutions,
  });

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

function getPrimaryTypeInner(expression: ExpressionNode, ctx: Context): PrimaryTypeResult {
  if (expression.kind === "NumberLiteral") {
    return primaryType({ kind: "Int" });
  } else if (expression.kind === "BoolLiteral") {
    return primaryType({ kind: "Bool" });
  } else if (expression.kind === "EmptyList") {
    const elementType = ctx.generator.gen();
    return primaryType({ kind: "List", elementType });
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
    return primaryType(substituteType(typeScheme.type, ...substituions));
  } else if (expression.kind === "BinaryExpression") {
    switch (expression.op.kind) {
      case "Add":
      case "Sub":
      case "Multiply":
      case "LessThan":
        return mapValue(
          getPrimaryTypeInner(expression.left, ctx),
          getPrimaryTypeInner(expression.right, ctx),
        )((left, right) =>
          mapValue(
            unify([
              ...toEquationSet(left, right),
              {
                lhs: left.expressionType,
                rhs: { kind: "Int" },
              },
              {
                lhs: right.expressionType,
                rhs: { kind: "Int" },
              },
            ]),
          )(unified =>
            primaryType(
              {
                kind: expression.op.kind === "LessThan" ? "Bool" : "Int",
              },
              unified,
            ),
          ),
        );
      default:
        // @ts-expect-error
        throw new Error(`invalid operation ${expression.op.kind}`);
    }
  } else if (expression.kind === "ListConstructor") {
    return mapValue(
      getPrimaryTypeInner(expression.head, ctx),
      getPrimaryTypeInner(expression.tail, ctx),
    )((head, tail) =>
      mapValue(
        unify([
          ...toEquationSet(head, tail),
          {
            lhs: tail.expressionType,
            rhs: {
              kind: "List",
              elementType: head.expressionType,
            },
          },
        ]),
      )(unified => primaryType(substituteType(tail.expressionType, ...unified), unified)),
    );
  } else if (expression.kind === "IfExpression") {
    return mapValue(
      getPrimaryTypeInner(expression.cond, ctx),
      getPrimaryTypeInner(expression.then, ctx),
      getPrimaryTypeInner(expression.else, ctx),
    )((cond, thenVal, elseVal) =>
      mapValue(
        unify([
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
        ]),
      )(unified => primaryType(substituteType(thenVal.expressionType, ...unified), unified)),
    );
  } else if (expression.kind === "MatchExpression") {
    return mapValue(
      getPrimaryTypeInner(expression.exp, ctx),
      getPrimaryTypeInner(expression.emptyClause, ctx),
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
      return mapValue(getPrimaryTypeInner(expression.consClause, { ...ctx, env: childEnv }))(consClause =>
        mapValue(
          unify([
            ...toEquationSet(exp, emptyClause, consClause),
            { lhs: exp.expressionType, rhs: listType },
            { lhs: emptyClause.expressionType, rhs: consClause.expressionType },
          ]),
        )(unified => primaryType(substituteType(emptyClause.expressionType, ...unified), unified)),
      );
    });
  } else if (expression.kind === "LetExpression") {
    return mapValue(getPrimaryTypeInner(expression.binding, ctx))(binding => {
      const scheme = getClosure(binding.expressionType, substituteEnv(ctx.env, ...binding.substitutions));
      const env = createChildEnvironment(expression.identifier, scheme, ctx.env);
      return mapValue(getPrimaryTypeInner(expression.exp, { ...ctx, env }))(exp =>
        mapValue(unify(toEquationSet(binding, exp)))(unified =>
          primaryType(substituteType(exp.expressionType, ...unified), unified),
        ),
      );
    });
  } else if (expression.kind === "LetRecExpression") {
    const funcType = ctx.generator.gen();
    const paramType = ctx.generator.gen();
    const bodyEnv = createChildEnvironment(
      expression.binding.param,
      schemeFromType(paramType),
      createChildEnvironment(expression.identifier, schemeFromType(funcType), ctx.env),
    );
    return mapValue(getPrimaryTypeInner(expression.binding.body, { ...ctx, env: bodyEnv }))(bindingBody =>
      mapValue(
        unify([
          ...toEquationSet(bindingBody),
          {
            lhs: funcType,
            rhs: {
              kind: "Function",
              paramType,
              returnType: bindingBody.expressionType,
            },
          },
        ]),
      )(unifiedBody => {
        const scheme = getClosure(substituteType(funcType, ...unifiedBody), substituteEnv(ctx.env, ...unifiedBody));
        const childEnv = createChildEnvironment(expression.identifier, scheme, ctx.env);
        return mapValue(getPrimaryTypeInner(expression.exp, { ...ctx, env: childEnv }))(exp =>
          mapValue(unify(toEquationSet({ substitutions: unifiedBody }, exp)))(unifiedExp =>
            primaryType(substituteType(exp.expressionType, ...unifiedExp), unifiedExp),
          ),
        );
      }),
    );
  } else if (expression.kind === "FunctionDefinition") {
    const paramType = ctx.generator.gen();
    const env = createChildEnvironment(expression.param, schemeFromType(paramType), ctx.env);
    return mapValue(getPrimaryTypeInner(expression.body, { ...ctx, env }))(body =>
      primaryType(
        substituteType(
          {
            kind: "Function",
            paramType,
            returnType: body.expressionType,
          },
          ...body.substitutions,
        ),
        body.substitutions,
      ),
    );
  } else if (expression.kind === "FunctionApplication") {
    return mapValue(
      getPrimaryTypeInner(expression.callee, ctx),
      getPrimaryTypeInner(expression.argument, ctx),
    )((callee, argument) => {
      const returnType = ctx.generator.gen();
      return mapValue(
        unify([
          ...toEquationSet(callee, argument),
          {
            lhs: callee.expressionType,
            rhs: {
              kind: "Function",
              paramType: argument.expressionType,
              returnType,
            },
          },
        ]),
      )(unified => primaryType(substituteType(returnType, ...unified), unified));
    });
  }

  // @ts-expect-error
  throw new Error(`Unreachable code: ${expression.kind}`);
}

export function getPrimaryType(expression: ExpressionNode) {
  return getPrimaryTypeInner(expression, {
    generator: new ParmGenerator(),
    env: createRootEnvironment(),
  });
}
