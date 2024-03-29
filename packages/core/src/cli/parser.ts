import path from "path";
import { Logger } from "./logger";

type BooleanOptionEntry = {
  readonly alias?: string;
  readonly description?: string;
  readonly type: "boolean";
};

type StringOptionEntry = {
  readonly alias?: string;
  readonly description?: string;
  readonly defaultValue: string;
  readonly type: "string";
};

type OptionalStringOptionEntry = {
  readonly alias?: string;
  readonly description?: string;
  readonly type: "string";
};

type IntegerOptionEntry = {
  readonly alias?: string;
  readonly description?: string;
  readonly defaultValue?: number;
  readonly type: "int";
};

type CommandLineOptionEntry = BooleanOptionEntry | StringOptionEntry | OptionalStringOptionEntry | IntegerOptionEntry;

type OptionsHolder = {
  options: {
    [name: string]: CommandLineOptionEntry;
  };
};

export type CommandCliSetting = OptionsHolder & {
  readonly description: string;
};

type ParseOptions = {
  readonly baseUsage?: string;
  readonly options: {
    readonly [name: string]: CommandLineOptionEntry;
  };
  readonly logger: Logger;
};

type Dispatch<T extends CommandLineOptionEntry> = T extends BooleanOptionEntry
  ? boolean
  : T extends StringOptionEntry
    ? string
    : T extends OptionalStringOptionEntry
      ? string | undefined
      : T extends IntegerOptionEntry
        ? number
        : never;

type OptionsResult<T extends OptionsHolder> = {
  [P in keyof T["options"]]: Dispatch<T["options"][P]>;
};

export type CommandOptions<T extends CommandCliSetting> = {
  _: string[];
  options: OptionsResult<T>;
};

type ParseResult<T extends ParseOptions> = {
  _: string[];
  options: {
    [P in keyof T["options"]]: Dispatch<T["options"][P]>;
  };
  errors?: {
    unknownCommand?: string;
  };
  showHelp: () => void;
};

type RawOpt = { isShort: boolean; optName: string; optStrVal?: string };

function parseRaw(argv: string[]) {
  if (!argv.length) {
    return {
      // subCommandName: null,
      args: [],
      rawOptions: [],
    };
  }
  const rawOptions = [] as RawOpt[];
  let i = 0;
  const args = [] as string[];
  while (i < argv.length) {
    const current = argv[i];
    i++;
    if (current[0] === "-") {
      let isShort: boolean;
      let optName: string;
      let optStrVal: string | undefined = undefined;
      if (current[1] !== "-") {
        isShort = true;
        optName = current.slice(1);
      } else {
        isShort = false;
        optName = current.slice(2);
      }
      const idx = optName.indexOf("=");
      if (idx !== -1) {
        optStrVal = optName.slice(idx + 1);
        optName = optName.slice(0, idx);
      } else if (argv[i] && argv[i][0] !== "-") {
        optStrVal = argv[i];
        i++;
      }
      rawOptions.push({
        isShort,
        optName,
        optStrVal,
      });
    } else {
      args.push(current);
    }
  }
  return {
    args,
    rawOptions,
  };
}
export function createParser<T extends ParseOptions>(parseOptions: T) {
  const { logger } = parseOptions;

  const parse: (rawArguments?: string[]) => ParseResult<T> = (rawArguments = process.argv) => {
    const showHelp = () => {
      const lines: string[] = [];
      if (!parseOptions.baseUsage) {
        lines.push(`Usage: ${path.basename(rawArguments[1])} [options]`);
      } else {
        lines.push(`Usage: ${path.basename(rawArguments[1])} ${parseOptions.baseUsage}`);
      }
      lines.push("");
      lines.push("Options:");
      let line = "";
      Object.entries(parseOptions.options).forEach(([name, value]) => {
        line = " ";
        if (value.alias) {
          line += `-${value.alias}, `;
        }
        line += `--${name}`;
        if (value.description) {
          line += "".padStart(42 - line.length) + value.description;
        }
        if ("defaultValue" in value) {
          line += ` [default: ${value.defaultValue + ""}]`;
        }
        lines.push(line);
      });
      logger.info(lines.join("\n"));
    };

    const argv = rawArguments.slice(2);

    const { args, rawOptions } = parseRaw(argv);

    const getOptions = (x: OptionsHolder) => {
      const options = {} as any;
      Object.entries(x.options).forEach(([k, v]) => {
        let hit: RawOpt | undefined;
        if (v.alias) hit = rawOptions.find(x => x.optName === v.alias && x.isShort);
        if (!hit) hit = rawOptions.find(x => x.optName === k && !x.isShort);
        if (hit) {
          let value: boolean | string | number | undefined;
          if (v.type === "boolean") {
            value = true;
          } else if (v.type === "string") {
            value = hit.optStrVal;
          } else if (v.type === "int") {
            value = +(hit.optStrVal || "0");
          }
          options[k] = value;
        } else if ("defaultValue" in v) {
          options[k] = v.defaultValue;
        } else if (v.type === "boolean") {
          options[k] = false;
        } else if (v.type === "string") {
          options[k] = "";
        } else if (v.type === "int") {
          options[k] = 0;
        }
      });
      return options;
    };

    const baseOptions = getOptions(parseOptions) as any;

    const funcs = {
      showHelp,
    };

    return {
      _: args,
      options: baseOptions,
      ...funcs,
    };
  };

  return {
    parse,
  };
}
