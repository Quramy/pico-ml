# PicoML

[![github actions](https://github.com/Quramy/pico-ml/workflows/build/badge.svg)](https://github.com/Quramy/pico-ml/actions)
[![npm version](https://badge.fury.io/js/pico-ml.svg)](https://badge.fury.io/js/pico-ml)

A toy programming language which is a subset of OCaml.

```ocaml
let rec fact = fun n -> if n < 2 then 1 else n * fact(n - 1) in
let rec range = fun s -> fun e -> if s >= e then [] else s::(range (s + 1) e) in
let rec map = fun f -> fun list -> match list with [] -> [] | x::y -> (f x)::(map f y) in
map fact (range 1 7) (* ==> int list: [ 1, 2, 6, 24, 120, 720 ] *)
```

## Features

- Interpreter
- Type inference
- Compile to WASM

## Web Playground

[![Playground](https://raw.githubusercontent.com/Quramy/pico-ml/main/playground_capture.png)](https://quramy.github.io/pico-ml/)

[You can try PicoML here.](https://quramy.github.io/pico-ml/)

## How to use

### Install

```sh
$ npm i -g pico-ml
```

### REPL

You can REPL with `ipml` command.

```sh
$ ipml

# Input ML expression to evaluate
> let add = fun a -> fun b -> a + b in add 1 2;;
```

The REPL allows multiple line input. Enter `;;` to evaluate the input expression.

### Compiler

```ocaml
(* example.ml *)

let add = fun a -> fun b -> a + b in add 1 2
```

To compile Web Assembly module, use `pmlc` command.

```sh
$ pmlc example.ml
```

The generated module exports `main` function to evaluate the input expression.

```js
// Execute in browser

const instance = await WebAssembly.instatiateStreaming(fetch("example.wasm"), {});
const result = instance.exports["main"]();
console.log(result);
```

```js
// Execute in Node.js

const fs = require("fs/promises");

(async () => {
  const source = await fs.readFile("example.wasm");
  const { instance } = await WebAssembly.instantiate(source, {});
  const result = instance.exports["main"]();
  console.log(result);
})();
```

And `pico-mlc` can also outputs WAT file with `-t` option.

```sh
$ pmlc example.ml -t
```

## Language

### BNF

```
expr    ::= id |
            int |
            decimal |
            bool |
            "[]" |
            expr expr |
            unop expr |
            expr binop expr |
            expr "::" expr |
            "if" expr "then" expr "else" expr |
            "match" expr "with" clause |
            "fun" id "->" expr |
            "let" id "=" expr "in" expr |
            "let" "rec" id "=" "fun" id "->" expr "in" expr

clause  ::= pat "->" expr | pat "->" expr "|" clause

pat     ::= id | "[]" | "_" | pat "::" pat

id      ::= (letter | "_"){ letter | digit | "_" | "'" }

unop    ::= "-" | "-."

binop   ::= "+" | "-" | "*" | +." | "-." | "*." | "<" | ">" | "<=" | ">=" | "==" | "!=" | "&&" | "||"

bool    ::= "true" | "false"

int     ::= (digit)+

decimal ::= digit+"."digit*

letter  ::= "a" | ... | "z" | "A" | ... | "Z"

digit   ::= "0" | ... | "9"
```

## License

MIT
