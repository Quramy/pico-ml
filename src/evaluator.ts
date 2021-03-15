import { ExpressionNode, IdentifierNode, FunctionDefinitionNode } from "./parser";

export interface EvaluationFailure {
  readonly kind: "Failure";
  readonly failure: true;
  readonly message: string;
}

export interface Environment {
  get(identifier: IdentifierNode): EvaluationValue | undefined;
  print(): readonly string[];
}

export interface Closure {
  readonly kind: "Closure";
  readonly functionDefinition: FunctionDefinitionNode;
  readonly env: Environment;
  readonly closureModifier?: string;
}

export interface RecClosure extends Closure {
  readonly closureModifier: "Recursive";
  readonly recursievId: IdentifierNode;
}

export type EvaluationValue = number | boolean | Closure;

export type EvaluationResult =
  | {
      ok: true;
      value: EvaluationValue;
    }
  | {
      ok: false;
      value: EvaluationFailure;
    };

export function isClosure(value: EvaluationValue): value is Closure {
  return typeof value === "object" && value.kind === "Closure";
}

export function isRecClosure(value: EvaluationValue): value is RecClosure {
  return typeof value === "object" && value.kind === "Closure" && value.closureModifier === "Recursive";
}

export function getEvaluationResultTypeName(value: EvaluationValue): string {
  if (isRecClosure(value)) {
    return "recursive function";
  } else if (isClosure(value)) {
    return "function";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "boolean") {
    return "boolean";
  }
  return undefined as never;
}

export function getEvaluationResultValue(result: EvaluationResult): string {
  if (!result.ok) return result.value.message;
  if (isClosure(result.value)) return getEvaluationResultTypeName(result.value);
  return result.value.toString();
}

function ok(value: EvaluationValue): EvaluationResult {
  return {
    ok: true,
    value,
  };
}

function error(message: string): EvaluationResult {
  return {
    ok: false,
    value: {
      kind: "Failure",
      failure: true,
      message,
    },
  };
}

function createRootEnvironment(): Environment {
  return {
    get() {
      return undefined;
    },
    print() {
      return [];
    },
  };
}

function createChildEnvironment(id: IdentifierNode, value: EvaluationValue, parent: Environment): Environment {
  return {
    get(identifier: IdentifierNode) {
      if (id.name === identifier.name) {
        return value;
      }
      return parent.get(identifier);
    },
    print() {
      return [...parent.print(), `${id.name}: ${getEvaluationResultValue({ ok: true, value })}`];
    },
  };
}

function createClosure(functionDefinition: FunctionDefinitionNode, env: Environment): Closure {
  return {
    kind: "Closure",
    env,
    functionDefinition,
  };
}

function createRecClosure(
  functionDefinition: FunctionDefinitionNode,
  env: Environment,
  recursievId: IdentifierNode,
): RecClosure {
  return {
    ...createClosure(functionDefinition, env),
    closureModifier: "Recursive",
    recursievId,
  };
}

function mapNumber(
  left: EvaluationValue,
  right: EvaluationValue,
  cb: (a: number, b: number) => EvaluationValue,
): EvaluationResult {
  if (typeof left !== "number") {
    return error(`The left operand is not number. ${getEvaluationResultTypeName(left)}`);
  }
  if (typeof right !== "number") {
    return error(`The right operand is not number. ${getEvaluationResultTypeName(right)}`);
  }
  return ok(cb(left, right));
}

function mapEvalVal(env: Environment) {
  return (...nodes: ExpressionNode[]) => (cb: (...values: EvaluationValue[]) => EvaluationResult) => {
    const values: EvaluationValue[] = [];
    for (const node of nodes) {
      const result = evaluateWithEnv(node, env);
      if (!result.ok) return result;
      values.push(result.value);
    }
    return cb(...values);
  };
}

function evaluateWithEnv(expression: ExpressionNode, env: Environment): EvaluationResult {
  if (expression.kind === "BoolLiteral") {
    return ok(expression.value);
  } else if (expression.kind === "NumberLiteral") {
    return ok(expression.value);
  } else if (expression.kind === "Identifier") {
    const value = env.get(expression);
    if (value == null) {
      return error(`variable ${expression.name} is not defined`);
    }
    return ok(value);
  } else if (expression.kind === "FunctionDefinition") {
    return ok(createClosure(expression, env));
  } else if (expression.kind === "BinaryExpression") {
    return mapEvalVal(env)(expression.left, expression.right)((left, right) => {
      switch (expression.op.kind) {
        case "Add":
          return mapNumber(left, right, (l, r) => l + r);
        case "Sub":
          return mapNumber(left, right, (l, r) => l - r);
        case "Multiply":
          return mapNumber(left, right, (l, r) => l * r);
        case "LessThan":
          return mapNumber(left, right, (l, r) => l < r);
        default:
          return undefined as never;
      }
    });
  } else if (expression.kind === "IfExpression") {
    return mapEvalVal(env)(expression.cond)(condition => {
      if (typeof condition === "boolean") {
        if (condition) {
          return evaluateWithEnv(expression.then, env);
        } else {
          return evaluateWithEnv(expression.else, env);
        }
      } else {
        return error(`condition should be boolean, but: ${getEvaluationResultTypeName(condition)}.`);
      }
    });
  } else if (expression.kind === "LetRecExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = createRecClosure(binding, env, identifier);
    const childEnv = createChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "LetExpression") {
    return mapEvalVal(env)(expression.binding)(boundValue => {
      const childEnv = createChildEnvironment(expression.identifier, boundValue, env);
      return evaluateWithEnv(expression.exp, childEnv);
    });
  } else if (expression.kind === "FunctionApplication") {
    return mapEvalVal(env)(expression.callee, expression.argument)((callee, argument) => {
      if (!isClosure(callee)) {
        return error(`should be function, but ${getEvaluationResultTypeName(callee)}}`);
      }
      if (!isRecClosure(callee)) {
        return evaluateWithEnv(
          callee.functionDefinition.body,
          createChildEnvironment(callee.functionDefinition.param, argument, callee.env),
        );
      } else {
        const recEnv = createChildEnvironment(callee.recursievId, callee, callee.env);
        return evaluateWithEnv(
          callee.functionDefinition.body,
          createChildEnvironment(callee.functionDefinition.param, argument, recEnv),
        );
      }
    });
  }
  return error(`invalid node kind`);
}

export function evaluate(expression: ExpressionNode) {
  return evaluateWithEnv(expression, createRootEnvironment());
}
