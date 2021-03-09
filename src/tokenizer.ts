export interface NumberToken {
  tokenKind: "Number";
  value: number;
}

export interface BoolToken {
  tokenKind: "Boolean";
  value: boolean;
}

export interface LeftParenthesisToken {
  tokenKind: "LeftParenthesis";
}

export interface RightParenthesisToken {
  tokenKind: "RightParenthesis";
}

export interface PlusToken {
  tokenKind: "Plus";
}

export interface MinusToken {
  tokenKind: "Minus";
}

export interface TimesToken {
  tokenKind: "Times";
}

export interface LessThanToken {
  tokenKind: "LessThan";
}

export interface IfToken {
  tokenKind: "If";
}

export interface ThenToken {
  tokenKind: "Then";
}

export interface ElseToken {
  tokenKind: "Else";
}

export type Token =
  | NumberToken
  | BoolToken
  | LeftParenthesisToken
  | RightParenthesisToken
  | PlusToken
  | MinusToken
  | TimesToken
  | LessThanToken
  | IfToken
  | ThenToken
  | ElseToken;

export type TokenKind = Token["tokenKind"];
export type Tokens = Token[];

type ExceptFalsy<T> = T extends 0 | null | undefined | false ? never : T;

type MatchClause<T> = [() => T, (v: ExceptFalsy<T>) => any];

class Matcher {
  private clauses: MatchClause<any>[] = [];
  private defaultAction = () => {};

  match<T>(condition: () => T, action: (v: ExceptFalsy<T>) => any) {
    this.clauses.push([condition, action]);
    return this;
  }

  default(action: () => any) {
    this.defaultAction = action;
    return this;
  }

  exec() {
    const hit = this.clauses.some(([cond, action]) => {
      const r = cond();
      if (r) action(r);
      return !!r;
    });
    if (!hit) {
      this.defaultAction();
    }
    return hit;
  }
}

function reservedWord(input: string, word: string) {
  if (!input.startsWith(word)) return false;
  if (!input.slice(word.length).match(/^[a-zA-Z0-9_\$]/)) {
    return word.length;
  } else {
    return false;
  }
}

function integer(input: string) {
  const hit = input.match(/(\d+)/);
  if (!hit) return false;
  const v = Number.parseInt(hit[1], 10);
  return [v, hit[1]] as const;
}

export function tokenize(input: string) {
  const tokens: Tokens = [];

  const matcher = new Matcher()
    .match(
      () => input.startsWith(" "),
      () => (input = input.slice(1))
    )
    .match(
      () => reservedWord(input, "true"),
      v => {
        tokens.push({ tokenKind: "Boolean", value: true });
        input = input.slice(v);
      }
    )
    .match(
      () => reservedWord(input, "false"),
      v => {
        tokens.push({ tokenKind: "Boolean", value: false });
        input = input.slice(v);
      }
    )
    .match(
      () => reservedWord(input, "if"),
      v => {
        tokens.push({ tokenKind: "If" });
        input = input.slice(v);
      }
    )
    .match(
      () => reservedWord(input, "then"),
      v => {
        tokens.push({ tokenKind: "Then" });
        input = input.slice(v);
      }
    )
    .match(
      () => reservedWord(input, "else"),
      v => {
        tokens.push({ tokenKind: "Else" });
        input = input.slice(v);
      }
    )
    .match(
      () => input.startsWith("("),
      () => {
        tokens.push({ tokenKind: "LeftParenthesis" });
        input = input.slice(1);
      }
    )
    .match(
      () => input.startsWith(")"),
      () => {
        tokens.push({ tokenKind: "RightParenthesis" });
        input = input.slice(1);
      }
    )
    .match(
      () => input.startsWith("+"),
      () => {
        tokens.push({ tokenKind: "Plus" });
        input = input.slice(1);
      }
    )
    .match(
      () => input.startsWith("-"),
      () => {
        tokens.push({ tokenKind: "Minus" });
        input = input.slice(1);
      }
    )
    .match(
      () => input.startsWith("*"),
      () => {
        tokens.push({ tokenKind: "Times" });
        input = input.slice(1);
      }
    )
    .match(
      () => input.startsWith("<"),
      () => {
        tokens.push({ tokenKind: "LessThan" });
        input = input.slice(1);
      }
    )
    .match(
      () => integer(input),
      ([value, strValue]) => {
        tokens.push({ tokenKind: "Number", value });
        input = input.slice(strValue.length);
      }
    )
    .default(() => {
      throw new Error("invalid input: " + input);
    });

  while (input.length > 0) {
    matcher.exec();
  }
  return tokens;
}
