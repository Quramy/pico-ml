import { ExpressionNode, IdentifierNode, FunctionDefinitionNode } from "./parser";

export interface EvaluationFailure {
  readonly kind: "Failure";
  readonly failure: true;
  readonly message: string;
}

export interface Environment {
  get(identifier: IdentifierNode): EvaluetionValue | undefined;
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

export type EvaluetionValue = number | boolean | Closure;

export type EvaluationResult = EvaluetionValue | EvaluationFailure;

export function isFailed(result: EvaluationResult): result is EvaluationFailure {
  return typeof result === "object" && result.kind === "Failure";
}

export function isClosure(value: EvaluationResult): value is Closure {
  return typeof value === "object" && value.kind === "Closure";
}

export function isRecClosure(value: EvaluationResult): value is RecClosure {
  return typeof value === "object" && value.kind === "Closure" && value.closureModifier === "Recursive";
}

export function getEvaluationResultTypeName(value: EvaluationResult): string {
  if (isFailed(value)) {
    return "failure";
  } else if (isRecClosure(value)) {
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

export function getEvaluationResultValue(value: EvaluationResult): string {
  if (isFailed(value) || isClosure(value)) return getEvaluationResultTypeName(value);
  return value.toString();
}

function createFailure(message: string): EvaluationFailure {
  return {
    kind: "Failure",
    failure: true,
    message,
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

function createChildEnvironment(id: IdentifierNode, value: EvaluetionValue, parent: Environment): Environment {
  return {
    get(identifier: IdentifierNode) {
      if (id.name === identifier.name) {
        return value;
      }
      return parent.get(identifier);
    },
    print() {
      return [...parent.print(), `${id.name}: ${getEvaluationResultValue(value)}`];
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

function tryNumber(
  left: EvaluationResult,
  right: EvaluationResult,
  cb: (a: number, b: number) => EvaluationResult,
): EvaluationResult {
  if (isFailed(left)) return left;
  if (isFailed(right)) return right;
  if (typeof left !== "number") {
    return createFailure(`The left operand is not number. ${getEvaluationResultTypeName(left)}`);
  }
  if (typeof right !== "number") {
    return createFailure(`The right operand is not number. ${getEvaluationResultTypeName(right)}`);
  }
  return cb(left, right);
}

function evaluateWithEnv(expression: ExpressionNode, env: Environment): EvaluationResult {
  if (expression.kind === "BoolLiteral") {
    return expression.value;
  } else if (expression.kind === "NumberLiteral") {
    return expression.value;
  } else if (expression.kind === "Identifier") {
    const v = env.get(expression);
    if (v == null) {
      return createFailure(`variable ${expression.name} is not defined`);
    }
    return v;
  } else if (expression.kind === "FunctionDefinition") {
    return createClosure(expression, env);
  } else if (expression.kind === "BinaryExpression") {
    const resultLeft = evaluateWithEnv(expression.left, env);
    const resultRight = evaluateWithEnv(expression.right, env);
    if (expression.op.kind === "Add") {
      return tryNumber(resultLeft, resultRight, (l, r) => l + r);
    } else if (expression.op.kind === "Multiply") {
      return tryNumber(resultLeft, resultRight, (l, r) => l * r);
    } else if (expression.op.kind === "Sub") {
      return tryNumber(resultLeft, resultRight, (l, r) => l - r);
    } else if (expression.op.kind === "LessThan") {
      return tryNumber(resultLeft, resultRight, (l, r) => l < r);
    }
  } else if (expression.kind === "IfExpression") {
    const condition = evaluateWithEnv(expression.cond, env);
    if (isFailed(condition)) return condition;
    if (typeof condition === "boolean") {
      if (condition) {
        return evaluateWithEnv(expression.then, env);
      } else {
        return evaluateWithEnv(expression.else, env);
      }
    } else {
      return createFailure(`condition should be boolean, but: ${getEvaluationResultTypeName(condition)}.`);
    }
  } else if (expression.kind === "LetRecExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = createRecClosure(binding, env, identifier);
    const childEnv = createChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "LetExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = evaluateWithEnv(binding, env);
    if (isFailed(boundValue)) return boundValue;
    const childEnv = createChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "FunctionApplication") {
    const callee = evaluateWithEnv(expression.callee, env);
    if (!isClosure(callee)) {
      return createFailure(`should be function, but ${getEvaluationResultTypeName(callee)}}`);
    }
    const argument = evaluateWithEnv(expression.argument, env);
    if (isFailed(argument)) {
      return argument;
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
  }
  return createFailure(`invalid node kind. ${expression.kind}`);
}

export function evaluate(expression: ExpressionNode) {
  return evaluateWithEnv(expression, createRootEnvironment());
}
