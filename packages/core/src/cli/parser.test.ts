import { createParser } from "./parser";
import { Logger } from "./logger";

class StringLogger implements Logger {
  private _log: string[] = [];
  error(): void {
    throw new Error("Method not implemented.");
  }
  info(...args: string[]): void {
    this._log.push(args.join(", "));
  }
  debug(): void {
    throw new Error("Method not implemented.");
  }
  print() {
    return this._log.join("\n");
  }
}

describe("CLI parser result", () => {
  it("should parse boolean options", () => {
    const parser = createParser({
      options: {
        opt: {
          type: "boolean",
        },
      },
      logger: new StringLogger(),
    });
    expect(parser.parse(["", "test-cmd"]).options.opt).toBe(false);
    expect(parser.parse(["", "test-cmd", "--opt"]).options.opt).toBe(true);
    expect(parser.parse(["", "test-cmd", "--opt=hoge"]).options.opt).toBe(true);
  });

  it("should parse string options", () => {
    const parser = createParser({
      options: {
        opt: {
          type: "string",
        },
      },
      logger: new StringLogger(),
    });
    expect(parser.parse(["", "test-cmd"]).options.opt).toBe("");
    expect(parser.parse(["", "test-cmd", "--opt", "hoge"]).options.opt).toBe("hoge");
    expect(parser.parse(["", "test-cmd", "--opt=hoge"]).options.opt).toBe("hoge");
  });

  it("should parse string options with default value", () => {
    const parser = createParser({
      options: {
        opt: {
          type: "string",
          defaultValue: "foo",
        },
      },
      logger: new StringLogger(),
    });
    expect(parser.parse(["", "test-cmd"]).options.opt).toBe("foo");
    expect(parser.parse(["", "test-cmd", "--opt", "hoge"]).options.opt).toBe("hoge");
    expect(parser.parse(["", "test-cmd", "--opt=hoge"]).options.opt).toBe("hoge");
  });

  it("should parse int options", () => {
    const parser = createParser({
      options: {
        opt: {
          type: "int",
        },
      },
      logger: new StringLogger(),
    });
    expect(parser.parse(["", "test-cmd"]).options.opt).toBe(0);
    expect(parser.parse(["", "test-cmd", "--opt", "100"]).options.opt).toBe(100);
    expect(parser.parse(["", "test-cmd", "--opt=100"]).options.opt).toBe(100);
  });

  it("should parse short options", () => {
    const parser = createParser({
      options: {
        opt: {
          alias: "o",
          type: "boolean",
        },
      },
      logger: new StringLogger(),
    });
    expect(parser.parse(["", "test-cmd", "-o"]).options.opt).toBe(true);
  });

  it("should show help", () => {
    const logger = new StringLogger();
    const parser = createParser({
      options: {
        version: {
          alias: "-v",
          description: "Print version",
          type: "boolean",
        },
      },
      logger,
    });
    parser.parse(["", "test-cmd"]).showHelp();
    expect(logger.print()).toBeTruthy();
  });
});
