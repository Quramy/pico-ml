import { parse } from "./parser";
import { evaluate } from "./evaluator";

process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", function (chunk) {
  const str = chunk.toString("utf-8").trim();
  if (str === "quit") {
    process.exit();
  }
  const result = evaluate(parse(str));
  console.log(result);
});
