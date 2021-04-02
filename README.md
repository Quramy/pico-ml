# PicoML

A toy programming language which is a dialect of ML.

```ocaml
let rec map = fun f -> fun list -> match list with [] -> [] | x::y -> (f x)::(map f y) in
let rec range = fun n -> fun l -> if n < l then n::(range (n + 1) l) else [] in
let rec fact = fun n -> if n < 2 then 1 else n * fact(n - 1) in
let list = range 0 6 in
map fact list (*  ==> int list: [ 1, 1, 2, 6, 24, 120 ] *)
```

## How to use

### Requirements

- Node.js

### Install

```sh
npm i
```

### Start REPL

```sh
npm start
```

## Language

# BNF

```
expr   ::= id |
           int |
           bool |
           "[]" |
           expr expr |
           "-" expr |
           expr op expr |
           expr "::" expr |
           "if" expr "then" expr "else" expr |
           "match" expr "with" clause |
           "fun" id "->" expr |
           "let" id "=" expr "in" expr |
           "let" "rec" id "=" "fun" id "->" expr "in" expr

clause ::= pat "->" expr | pat "->" expr "|" clause

pat    ::= id | "[]" | "_" | pat "::" pat

id     ::= (letter | "_"){ letter | digit | "_" | "'" }

int    ::= (digit)+

bool   ::= "true" | "false"

op     ::= "+" | "-" | "*" | "<"

letter ::= "a" | ... | "z" | "A" | ... | "Z"

digit  ::= "0" | ... | "9"
```
