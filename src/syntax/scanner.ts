import { Scanner as BaseScnner } from "../parser-util";

export class Scanner extends BaseScnner {
  leadingComment(pos: number) {
    if (!this.input.slice(pos).startsWith("(*")) return 0;
    let level = 1;
    let l = 2;
    while (level > 0) {
      if (this.input.substr(pos + l, 2) === "*)") {
        l += 2;
        level--;
      } else if (this.input.substr(pos + l, 2) === "(*") {
        l += 2;
        level++;
      } else {
        ++l;
      }
    }
    return l;
  }
}
