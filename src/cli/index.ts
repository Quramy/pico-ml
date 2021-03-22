import readline from "readline";
import { parse } from "../parser";
import { createTypePrinter, getPrimaryType } from "../type-checker";
import { evaluate, getPrintableEvaluationValue } from "../evaluate";
import { color } from "./color";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt(color.green("> "));
rl.prompt();

let buf: string[] = [];
const typePrinter = createTypePrinter();

rl.on("line", line => {
  const str = line.trim();
  if (str.toLowerCase() === "quit" || str.toLowerCase() === "exit") {
    process.exit();
  }
  const idx = str.indexOf(";;");
  if (idx !== -1) {
    buf.push(str.slice(0, idx));

    // syntax check
    const code = buf.join(" ");
    buf = [];
    evaluateExpression(code);
  } else {
    buf.push(str);
  }
  rl.prompt();
});

function evaluateExpression(code: string) {
  // syntax check
  const tree = parse(code);

  if (!tree) {
    console.log(color.red("Syntax error"));
    return;
  }

  // type check
  const typeResult = getPrimaryType(tree);
  if (!typeResult.ok) {
    console.log(color.red("Type error: " + typeResult.value.message));
    return;
  }

  const typeStr = typePrinter(typeResult.value.expressionType);
  process.stdout.write(`${color.yellow("==> ")}${typeStr}: `);

  // evaluation
  const result = evaluate(tree);
  if (result.ok) {
    console.log(getPrintableEvaluationValue(result.value));
  } else {
    console.log(color.red(result.value.message));
  }
}
