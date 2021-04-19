export class Scanner {
  private _pos = 0;
  constructor(readonly input: string) {}

  private head(n = 0) {
    if (n > 0) {
      return this.input.slice(this._pos).trimLeft().slice(n);
    } else {
      return this.input.slice(this._pos).trimLeft();
    }
  }

  startsWith(word: string, offset = 0) {
    return this.head(offset).startsWith(word);
  }

  match(regexp: RegExp, offset = 0) {
    return this.head(offset).match(regexp);
  }

  leadingWhitespace() {
    let i = 0;
    for (; ; i++) {
      const c = this.input.slice(this._pos)[i];
      if (c === " ") continue;
      if (c === "\t") continue;
      if (c === "\r") continue;
      if (c === "\n") continue;
      break;
    }
    return i;
  }

  consume(length: number) {
    const l = this.leadingWhitespace() + length;
    const loc = {
      pos: this._pos,
      end: this._pos + l,
    };
    this._pos += l;
    return loc;
  }

  get pos() {
    return this._pos;
  }

  back(pos: number) {
    this._pos = pos;
    return pos;
  }
}
