# CoPL TypeScript Implementation

書籍 [プログラミング言語の基礎概念](https://www.saiensu.co.jp/search/?isbn=978-4-7819-1285-1&y=2011) に登場する言語の TypeScript 実装です。

書籍中の言語である ML5 について、以下を実装しています。

- 評価
- 主要型の型推論

型推論については、型スキームによる let 多相に対応済み

## How to use

### Requirements

- Node.js

### Install

レポジトリを clone した後、以下を実行してください。

```sh
npm i
```

### REPL の起動

```sh
npm start
```

[![asciicast](https://asciinema.org/a/403571.svg)](https://asciinema.org/a/403571)

## BNF

```
expr   ::= id |
           int |
           bool |
           "[]" |
           expr expr |
           "-" expr |
           expr op expr |
           expr::expr |
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
