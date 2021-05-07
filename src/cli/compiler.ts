import fs from "fs/promises";
import path from "path";
import { parse } from "../syntax";
import { getPrimaryType, createTypePrinter } from "../type-checker";
import { compile } from "../compiler";
import { printAST, generateBinary } from "../wasm";

import { color } from "../string-util";
import { ErrorReporter } from "./error-reporter";

type MainOption = {
  readonly inputFilename: string;
  readonly target?: "binary" | "wat";
};

async function main({ inputFilename, target = "binary" }: MainOption) {
  const errorReporter = new ErrorReporter(process.cwd(), msg => console.error(msg));
  const code = await fs.readFile(inputFilename, "utf-8").catch(err => {
    console.error(err.message);
    process.exit(1);
  });
  const parseResult = parse(code);
  if (!parseResult.ok) {
    errorReporter.outputError({
      message: color.red("Syntax error: " + parseResult.value.message),
      content: code,
      fileName: inputFilename,
      occurence: parseResult.value.occurence,
    });
    process.exit(1);
  }

  const typeCheckResult = getPrimaryType(parseResult.value);
  if (!typeCheckResult.ok) {
    const message = typeCheckResult.value.messageWithTypes
      ? typeCheckResult.value.messageWithTypes(createTypePrinter())
      : typeCheckResult.value.message;
    errorReporter.outputError({
      message: color.red("Type error: " + message),
      content: code,
      fileName: inputFilename,
      occurence: typeCheckResult.value.occurence,
    });
    process.exit(1);
  }

  const compileResult = compile(parseResult.value);
  if (!compileResult.ok) {
    errorReporter.outputError({
      message: color.red("Type error: " + compileResult.value.message),
      content: code,
      fileName: inputFilename,
      occurence: compileResult.value.occurence,
    });
    process.exit(1);
  }

  if (target === "binary") {
    const outputFilename = path.basename(inputFilename, path.extname(inputFilename)) + ".wasm";
    const binResult = generateBinary(compileResult.value);
    if (!binResult.ok) {
      console.error(binResult.value);
      process.exit(1);
    }
    await fs.writeFile(outputFilename, binResult.value);
  } else {
    const outputFilename = path.basename(inputFilename, path.extname(inputFilename)) + ".wat";
    await fs.writeFile(outputFilename, printAST(compileResult.value), "utf-8");
  }
}

const inputFilename = process.argv.slice(1)[1];
if (!inputFilename) {
  console.error(`Usage: ${path.basename(process.argv.slice(1)[0])} <input_filename>`);
  process.exit(1);
}
const target = process.argv.slice(1)[2] === "-t" ? "wat" : "binary";

main({ inputFilename, target });
