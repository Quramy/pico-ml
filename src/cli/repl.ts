import readline from "readline";
import { parse } from "../syntax";
import { createTypePrinter, getPrimaryType } from "../type-checker";
import { evaluate, getPrintableEvaluationValue } from "../evaluate";
import { color } from "../string-util";
import { ErrorReporter } from "./error-reporter";

function getVersion() {
  const { version } = require("../../package.json");
  return version as string;
}

function welcome() {
  console.log(`Welcome to PicoML REPL v${getVersion()}.`);
  console.log('Type ".help" for more information.');
}

function createCommands(rl: readline.Interface) {
  let exampleNum = 0;

  const examples: string[][] = [
    ["1 + 1 ;;"],
    ["1 < 2 ;;"],
    ["3.14 ;;"],
    ["2.0 *. 1.5 ;;"],
    ["true != false ;;"],
    ["if 2 * 2 < 3 then true else false ;;"],
    ["fun x -> x ;;"],
    ["let fn = fun x -> x * 2 in", "fn 2;;"],
    ["let rec fact = fun n -> if n < 2 then 1 else n * fact(n - 1) in fact 7 ;;"],
    ["let rec array = fun n -> if n < 1 then [] else (n - 1)::(array(n - 1)) in"],
    [
      "let rec fact = fun n -> if n < 2 then 1 else n * fact(n - 1) in",
      "let rec range = fun s -> fun e -> if s >= e then [] else s::(range (s + 1) e) in",
      "let rec map = fun f -> fun list -> match list with [] -> [] | x::y -> (f x)::(map f y) in",
      "map fact (range 1 7) ;;",
    ],
  ];

  const commands: Record<string, () => void> = {
    help() {
      console.log(
        [
          ".example:  Display example expression.",
          ".next:     Display the next example expression.",
          ".prev:     Display the previous example expression.",
          ".help:     Show this message.",
          ".exit:     Exit REPL",
        ].join("\n"),
      );
      rl.prompt();
    },
    next() {
      exampleNum++;
      commands["example"]();
    },
    prev() {
      if (exampleNum > 0) {
        exampleNum--;
      } else {
        exampleNum = examples.length - 1;
      }
      commands["example"]();
    },
    example() {
      const size = examples.length;
      const example = examples[exampleNum % size];
      rl.prompt();
      example.forEach(line => {
        if (!line.endsWith(";;")) {
          rl.write(line + "\n");
          rl.prompt();
        } else {
          rl.write(line);
        }
      });
    },
    exit() {
      process.exit();
    },
    quit() {
      process.exit();
    },
  };
  return commands;
}

function evaluateExpression(code: string, reporter: ErrorReporter) {
  // syntax check
  const tree = parse(code);

  if (!tree.ok) {
    reporter.outputError({
      ...tree.value,
      fileName: "<REPL input>",
      content: code,
      message: color.red("Syntax error: " + tree.value.message),
    });
    return;
  }

  // type check
  const typeResult = getPrimaryType(tree.value);
  if (!typeResult.ok) {
    const message = typeResult.value.messageWithTypes
      ? typeResult.value.messageWithTypes(createTypePrinter())
      : typeResult.value.message;
    reporter.outputError({
      ...typeResult.value,
      fileName: "<REPL input>",
      content: code,
      message: color.red("Type error: " + message),
    });
    return;
  }

  const typePrinter = createTypePrinter({ remapWithSubstitutions: typeResult.value.rootPrimaryType.substitutions });
  const typeStr = typePrinter(typeResult.value.rootPrimaryType.expressionType);
  process.stdout.write(`${color.yellow("==> ")}${typeStr}: `);

  // evaluation
  const result = evaluate(tree.value);
  if (result.ok) {
    console.log(getPrintableEvaluationValue(result.value));
  } else {
    console.log(color.red(result.value.message));
    reporter.outputError({
      ...result.value,
      fileName: "<REPL input>",
      content: code,
      message: color.red(result.value.message),
    });
  }
}

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const errorReporter = new ErrorReporter(process.cwd(), console.log.bind(console));

  rl.setPrompt(color.green("> "));
  welcome();
  rl.prompt();

  let buf: string[] = [];
  const commands = createCommands(rl);
  rl.on("line", line => {
    const str = line.trim();
    if (str.startsWith(".") && commands[str.slice(1)]) {
      commands[str.slice(1)]();
      return;
    }
    const idx = str.indexOf(";;");
    if (idx !== -1) {
      buf.push(str.slice(0, idx));
      const code = buf.join("\n");
      buf = [];
      evaluateExpression(code, errorReporter);
    } else {
      buf.push(str);
    }
    rl.prompt();
  });
}

main();
