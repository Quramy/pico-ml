import { PrimaryTypeNode, TypeSubstitution } from "../types";
import { result } from "./_result";
import { substituteType } from "../substitute";

export const identifier: PrimaryTypeNode<"Identifier"> = (expression, ctx) => {
  const typeScheme = ctx.env.get(expression);
  if (!typeScheme) {
    return result.error({
      message: `No identifier ${expression.name}`,
      occurence: expression,
    });
  }
  const substitutions: TypeSubstitution[] = typeScheme.variables.map(v => ({
    from: v,
    to: ctx.generator.gen(expression),
  }));
  return result.ok({ ...substituteType(typeScheme.type, ...substitutions), referencedFrom: expression });
};
