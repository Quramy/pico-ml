# PicoML

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

## How to use

### Install

```sh
$ npm i -g pico-ml
```

### REPL

```sh
$ pico-ml

# Input ML expression to evaluate
> let add = fun a -> fun b -> a + b in add 1 2;;
```

The REPL allows multiple line input. Enter `;;` to evaluate the input expression.

### Compiler

```ocaml
(* example.ml *)

let add = fun a -> fun b -> a + b in add 1 2
```

To compile Web Assembly module, use `pico-mlc` command.

```sh
$ pico-mlc example.ml
```

The generated module exports `main` function to the input expression.

```js
// Execute in browser

WebAssembly.instatiateStreaming(fetch("example.wasm"), {}).then(instance => {
  const result = instance.exports["main"]();
  console.log(main);
});
```

And `pico-mlc` can also outputs WAT file with `-t` option.

```sh
$ pico-mlc example.ml -t
```

```js
// Execute in Node.js

const fs = require("fs/priomises");

const source = await fs.readFile("example.wasm");
const instance = WebAssembly.instantiate(source, {});
const result = instance.exports["main"]();
console.log(main);
```

## Language

### BNF

```
expr   ::= id |
           int |
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

clause ::= pat "->" expr | pat "->" expr "|" clause

pat    ::= id | "[]" | "_" | pat "::" pat

id     ::= (letter | "_"){ letter | digit | "_" | "'" }

unop   ::= "-"

binop  ::= "+" | "-" | "*" | "<" | ">" | "<=" | ">=" | "==" | "!="

bool   ::= "true" | "false"

int    ::= (digit)+

letter ::= "a" | ... | "z" | "A" | ... | "Z"

digit  ::= "0" | ... | "9"
```

## License

MIT
