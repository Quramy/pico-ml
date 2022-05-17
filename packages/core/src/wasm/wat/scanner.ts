import { Scanner as BaseScnner } from "../../parser-util";

export class Scanner extends BaseScnner {
  private _blockComment(pos: number) {
    if (!this.input.slice(pos).startsWith("(;")) return 0;
    let level = 1;
    let l = 2;
    while (level > 0 && pos + l < this.input.length) {
      if (this.input.substr(pos + l, 2) === ";)") {
        l += 2;
        level--;
      } else if (this.input.substr(pos + l, 2) === "(;") {
        l += 2;
        level++;
      } else {
        ++l;
      }
    }
    return l;
  }

  private _lineComment(pos: number) {
    if (!this.input.slice(pos).startsWith(";;")) return 0;
    let l = 2;
    while (pos + l < this.input.length) {
      if (this.input[pos + l] === "\n") break;
      ++l;
    }
    return l;
  }

  leadingComment(pos: number) {
    let l = 0;
    while (true) {
      const cl = this._lineComment(pos + l);
      const bl = this._blockComment(pos + l + cl);
      if (cl + bl === 0) break;
      l += cl + bl;
    }
    return l;
  }
}
