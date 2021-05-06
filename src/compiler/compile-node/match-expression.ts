import { createTreeTraverser, mapValue, ok } from "../../structure";
import { MatchClauseNode, MatchPatternNode, PatternMatchClauseNode } from "../../syntax";
import { factory, ExprNode } from "../../wasm";
import { CompileNodeFn, CompilationResult, Environment } from "../types";
import { createChildEnvironment } from "../environment";
import { matchPattern } from "./match-pattern";
import { getEnvAddrInstr, setEnvAddrInstr } from "../assets/modules/env";

const createEnvForExpression = createTreeTraverser<MatchPatternNode, Environment, Environment>({
  emptyListPattern: (_, env) => env,
  wildcardPattern: (_, env) => env,
  idPattern: ({ identifier }, env) => createChildEnvironment(identifier, env),
  listConsPattern: ({ head, tail }, env, next) => next(tail, next(head, env)),
});

export const matchExpression: CompileNodeFn<"MatchExpression"> = (node, ctx, next) => {
  ctx.useEnvironment();
  ctx.useMatcher();
  ctx.useLocalVar(factory.localVar(factory.valueType("i32"), factory.identifier("value_for_matcher")));
  ctx.useLocalVar(factory.localVar(factory.valueType("i32"), factory.identifier("matched_env_addr")));
  ctx.useLocalVar(factory.localVar(factory.valueType("i32"), factory.identifier("prev_env_addr")));
  const parentEnv = ctx.getEnv();
  const compileTryNextPattern = (matchClause: MatchClauseNode): CompilationResult => {
    const compilePatternMatchClause = (
      patternMatchClause: PatternMatchClauseNode,
      fallbackInstr: ExprNode,
    ): CompilationResult => {
      const createCallMatcherInstr = () => {
        ctx.matcherDefStack.enter();
        return matchPattern(patternMatchClause.pattern, ctx).map(matcherInstr => {
          const funcName = ctx.matcherDefStack.leave(matcherInstr);
          return [factory.controlInstr("call", [funcName])];
        });
      };
      const createExpressionInstr = () => {
        const expressionEnv = createEnvForExpression(patternMatchClause.pattern, parentEnv);
        ctx.setEnv(expressionEnv);
        return next(patternMatchClause.exp, ctx).tap(() => ctx.setEnv(parentEnv));
      };
      return mapValue(
        createCallMatcherInstr(),
        createExpressionInstr(),
      )((callMatcherInstr, expressionInstr) => {
        return ok([
          ...getEnvAddrInstr(),
          factory.variableInstr("local.get", [factory.identifier("value_for_matcher")]),
          ...callMatcherInstr,
          factory.variableInstr("local.tee", [factory.identifier("matched_env_addr")]),
          factory.ifInstr(
            factory.blockType([factory.valueType("i32")]),
            [
              ...getEnvAddrInstr(),
              factory.variableInstr("local.set", [factory.identifier("prev_env_addr")]),
              factory.variableInstr("local.get", [factory.identifier("matched_env_addr")]),
              ...setEnvAddrInstr(),
              ...expressionInstr,
              factory.variableInstr("local.get", [factory.identifier("prev_env_addr")]),
              ...setEnvAddrInstr(),
            ],
            fallbackInstr,
          ),
        ]);
      });
    };

    if (matchClause.kind === "PatternMatchClause") {
      return compilePatternMatchClause(matchClause, [factory.controlInstr("unreachable", [])]);
    } else {
      return compileTryNextPattern(matchClause.or).mapValue(fallbackInstr =>
        compilePatternMatchClause(matchClause.patternMatch, fallbackInstr),
      );
    }
  };

  return mapValue(
    next(node.exp, ctx),
    compileTryNextPattern(node.matchClause),
  )((expInstr, matchingInstr) =>
    ok([...expInstr, factory.variableInstr("local.set", [factory.identifier("value_for_matcher")]), ...matchingInstr]),
  );
};
