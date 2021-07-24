export const CODE_EXAMPLES = [
  {
    name: "Integer arimetic expression",
    code: `
(2 + 6) * 4 / 5
    `,
  },
  {
    name: "Floating number arithmetic expression",
    code: `
2.0 *. 1.6 +. 3.3
    `,
  },
  {
    name: "If expression",
    code: `
1 = 2 then true else false
    `,
  },
  {
    name: "Let expression",
    code: `
let a = 1 in
let b = 2 in
let a = 4 in

a * b + a
    `,
  },
  {
    name: "Function application",
    code: `
let add = fun a -> fun b -> a + b in
add 10 20
    `,
  },
  {
    name: "Recursive function",
    code: `
let rec fact = fun n ->
  if n < 2 then 1 else n * fact(n - 1) in
fact 10
    `,
  },
  {
    name: "List and pattern matching",
    code: `
let rec range = fun s -> fun e ->
  if s > e - 1 then [] else s::range (s + 1) e in

let rec map = fun f -> fun l ->
  match l with [] -> [] | x::y -> (f x)::(map f y) in

let l1 = range 0 10 in
let twice = fun x -> x * 2 in
map twice l1
    `,
  },
] as const;
