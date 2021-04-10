# PicoML

A toy programming language which is a dialect of ML.

```ocaml
let rec fact = fun n -> if n < 2 then 1 else n * fact(n - 1) in
let rec range = fun s -> fun e -> if s >= e then [] else s::(range (s + 1) e) in
let rec map = fun f -> fun list -> match list with [] -> [] | x::y -> (f x)::(map f y) in
map fact (range 1 7) (* ==> int list: [ 1, 2, 6, 24, 120, 720 ] *)
```

## How to use

```sh
npx pico-ml

# or

npm install -g pico-ml
pico-ml
```

## Language

### BNF

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

op     ::= "+" | "-" | "*" | "<" | ">" | "<=" | ">=" | "==" | "!="

letter ::= "a" | ... | "z" | "A" | ... | "Z"

digit  ::= "0" | ... | "9"
```

## License

MIT
