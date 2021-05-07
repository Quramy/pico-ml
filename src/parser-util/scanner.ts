export class Scanner {
  private _pos = 0;

  constructor(protected readonly input: string) {}

  private _head(n = 0) {
    const l = this._leadingTrivia();
    return this.input.substr(this._pos + l + n);
  }

  private _leadingTrivia() {
    let l = 0;
    while (true) {
      const p1 = this.leadingWhitespace(this._pos + l);
      const p2 = this.leadingComment(this._pos + l + p1);
      if (p1 === 0 && p2 === 0) break;
      l += p1 + p2;
    }
    return l;
  }

  hasNext(offset = 0) {
    const l = this.pos + this._leadingTrivia() + offset;
    return l < this.input.length;
  }

  slice(length: number) {
    return this._head().slice(0, length);
  }

  startsWith(word: string, offset = 0) {
    return this._head(offset).startsWith(word);
  }

  match(regexp: RegExp, offset = 0) {
    return this._head(offset).match(regexp);
  }

  leadingWhitespace(pos: number) {
    let i = 0;
    for (; ; i++) {
      const c = this.input[pos + i];
      if (c === " ") continue;
      if (c === "\t") continue;
      if (c === "\r") continue;
      if (c === "\n") continue;
      break;
    }
    return i;
  }

  leadingComment(_pos: number): number {
    return 0;
  }

  consume(length: number) {
    const s = this._leadingTrivia();
    const loc = {
      pos: this._pos + s,
      end: this._pos + s + length,
    };
    this._pos += s + length;
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
