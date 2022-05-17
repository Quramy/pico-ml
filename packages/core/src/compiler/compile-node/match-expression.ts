import { createTreeTraverser, mapValue, ok } from "../../structure";
import { MatchClauseNode, MatchPatternNode, PatternMatchClauseNode } from "../../syntax";
import { wat, factory, ExprNode } from "../../wasm";
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
  ctx.useLocalVar(wat.localVar`(local $value_for_matcher i32)`());
  ctx.useLocalVar(wat.localVar`(local $matched_env_addr i32)`());
  ctx.useLocalVar(wat.localVar`(local $prev_env_addr i32)`());
  const parentEnv = ctx.getEnv();
  const compileTryNextPattern = (matchClause: MatchClauseNode): CompilationResult => {
    const compilePatternMatchClause = (
      patternMatchClause: PatternMatchClauseNode,
      fallbackInstr: ExprNode,
    ): CompilationResult => {
      const createCallMatcherInstr = () => {
        ctx.matcherDefStack.enter();
        return matchPattern(patternMatchClause.pattern, ctx).map(matcherInstr => [
          factory.controlInstr("call", [ctx.matcherDefStack.leave(matcherInstr)]),
        ]);
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
        return ok(
          wat.instructions`
            ${getEnvAddrInstr}
            local.get $value_for_matcher
            ${() => callMatcherInstr}
            local.tee $matched_env_addr
            if (result i32)
              ${getEnvAddrInstr}
              local.set $prev_env_addr
              local.get $matched_env_addr
              ${setEnvAddrInstr}
              ${() => expressionInstr}
              local.get $prev_env_addr
              ${setEnvAddrInstr}
            else
              ${() => fallbackInstr}
            end
          `(),
        );
      });
    };

    if (matchClause.kind === "PatternMatchClause") {
      return compilePatternMatchClause(
        matchClause,
        wat.instructions`
          unreachable
        `(),
      );
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
    ok(
      wat.instructions`
          ${() => expInstr}
          local.set $value_for_matcher
          ${() => matchingInstr}
        `(),
    ),
  );
};
