import path from "path";
import { Position } from "../parser";
import { pos2location } from "./position-converter";
import { color } from "./color";

const lineMark = (line: number, width: number) => {
  const strLine = line + 1 + "";
  return color.invert(strLine.padStart(width - strLine.length)) + " ";
};

const lineMarkForUnderline = (width: number) => {
  return color.invert("".padStart(width)) + " ";
};

export type ErrorContent = {
  readonly fileName: string;
  readonly content: string;
  readonly message: string;
  readonly occurence: Position;
};

export class ErrorReporter {
  constructor(private readonly _currentDirectory: string, private readonly _output: (msg: string) => void = () => {}) {}

  outputError(error: ErrorContent) {
    if (!error.occurence.loc) {
      this._outputErrorWithoutLocation(error);
    } else {
      this._outputErrorWithLocation(error, error.occurence.loc);
    }
  }

  _outputErrorWithoutLocation(error: ErrorContent) {
    this._output(error.message);
  }

  _outputErrorWithLocation(error: ErrorContent, { pos: start, end }: { readonly pos: number; readonly end: number }) {
    const { message, fileName, content } = error;
    const startLC = pos2location(content, start);
    const endLC = pos2location(content, end);
    const relativeContentPath = path.isAbsolute(fileName) ? path.relative(this._currentDirectory, fileName) : fileName;
    const fileIndicator = `${relativeContentPath}:${startLC.line + 1}:${startLC.character + 1}`;
    const outputs = [`${color.thin(fileIndicator)} - ${message}`, ""];
    const allLines = content.split("\n");
    const preLines = allLines.slice(Math.max(startLC.line - 1, 0), startLC.line);
    const lines = allLines.slice(startLC.line, endLC.line + 1);
    const postLines = allLines.slice(endLC.line + 1, Math.min(allLines.length - 1, endLC.line + 2));
    const lineMarkerWidth = (Math.min(allLines.length - 1, endLC.line + 2) + "").length;
    for (let i = 0; i < preLines.length; ++i) {
      outputs.push(lineMark(i + startLC.line - 1, lineMarkerWidth) + color.thin(preLines[i]));
    }
    for (let i = 0; i < lines.length; ++i) {
      outputs.push(lineMark(i + startLC.line, lineMarkerWidth) + lines[i]);
      if (i === 0) {
        if (startLC.line === endLC.line) {
          outputs.push(
            lineMarkForUnderline(lineMarkerWidth) +
              "".padStart(startLC.character) +
              color.red("".padStart(endLC.character - startLC.character, "~")),
          );
        } else {
          outputs.push(
            lineMarkForUnderline(lineMarkerWidth) +
              "".padStart(startLC.character) +
              color.red("".padStart(lines[i].length - startLC.character, "~")),
          );
        }
      } else if (i === lines.length - 1) {
        outputs.push(lineMarkForUnderline(lineMarkerWidth) + color.red("".padStart(endLC.character, "~")));
      } else {
        outputs.push(lineMarkForUnderline(lineMarkerWidth) + color.red("".padStart(lines[i].length, "~")));
      }
    }
    for (let i = 0; i < postLines.length; ++i) {
      outputs.push(lineMark(i + endLC.line + 1, lineMarkerWidth) + color.thin(postLines[i]));
    }
    outputs.push("");
    const result = outputs.join("\n");
    this._output(result);
    return result;
  }
}
