import fs from "fs/promises";
import path from "path";
import { parse } from "../syntax";
import { getPrimaryType, createTypePrinter } from "../type-checker";
import { compile } from "../compiler";
import { printAST, generateBinary } from "../wasm";

import { color } from "../string-util";
import { ErrorReporter } from "./error-reporter";
import { createParser } from "./parser";
import { ConsoleLogger } from "./logger";

type MainOption = {
  readonly inputFilename: string;
  readonly target?: "binary" | "wat";
  readonly enableNameSection?: boolean;
};

async function main({ inputFilename, target = "binary", enableNameSection = false }: MainOption) {
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
    const binResult = generateBinary(compileResult.value, {
      enableNameSection,
    });
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

const cliParser = createParser({
  baseUsage: "source_file [options]",
  options: {
    help: {
      alias: "h",
      type: "boolean",
      description: "Print this message.",
    },
    text: {
      alias: "t",
      type: "boolean",
      description: "Output compiled .wat file.",
    },
    enableNameSection: {
      type: "boolean",
      description: "Emit WASM name section.",
    },
  },
  logger: new ConsoleLogger(),
});

const { _, options, showHelp } = cliParser.parse(process.argv);

if (options.help) {
  showHelp();
  process.exit(0);
}

const inputFilename = _[0];
if (!inputFilename) {
  showHelp();
  process.exit(1);
}
const target = options.text ? "wat" : "binary";
const enableNameSection = options.enableNameSection;

main({ inputFilename, target, enableNameSection });
