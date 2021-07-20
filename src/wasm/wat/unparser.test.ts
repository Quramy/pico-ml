import { parse } from "./parser";
import { unparse } from "./unparser";

const fixtures = [
  `
  (module
  )
  `,
  `
  (module
    (type $t (func (param i32) (result i32)))
  )
  `,
  `
  (module
    (type $fn (func (param i32) (result i32)))
    (func $main (type $fn)
      local.get 0
    )
  )
  `,
  `
  (module
    (func $main (result i32)
      i32.const 1
      if (result i32)
        i32.const 0
      else
        i32.const 1
      end
    )
  )
  `,
  `
  (module
    (func $main (result i32)
      i32.const 20
    )
  )
  `,
  `
  (module
    (func $main (result i64)
      i64.const 20
    )
  )
  `,
  `
  (module
    (func $main (result f32)
      f32.const 1.5
    )
  )
  `,
  `
  (module
    (func $main (result f64)
      f64.const 1.5
    )
  )
  `,
  `
  (module
    (func $main (param $a i32) (result i32)
      local.get $a
    )
  )
  `,
  `
  (module
    (func $main (result i32)
      i32.load offset=4
    )
  )
  `,
  `
  (module
    (func $main (result i32)
      call $fn
      call_indirect $tal (type $fn)
    )
  )
  `,
  `
  (module
    (table $tbl 1 2 funcref)
    (table $tbl 1 funcref)
    (table $tbl 1 externref)
  )
  `,
  `
  (module
    (table $tbl funcref (elem 0 1 2))
  )
  `,
  `
  (module
    (memory 1)
    (memory $mem 1 2)
  )
  `,
  `
  (module
    (global $g i32
      i32.const 0)
    (global $g (mut i32)
      i32.const 0)
  )
  `,
  `
  (module
    (export "main" (func $x))
    (export "main" (table $x))
    (export "main" (memory $x))
    (export "main" (global $x))
  )
  `,
  `
  (module
    (elem $elem
      (offset
        i32.const 0)
      func $fn $fn2)
  )
  `,
];

describe(unparse, () => {
  fixtures.forEach(code => {
    test("WAT: " + oneline(code), () => {
      const actual = parseAndUnparse(code);
      // console.log(actual);
      expect(deindent(actual)).toBe(deindent(code));
    });
  });
});

function oneline(text: string) {
  return text.trim().replace(/\n/g, " ").replace(/\s+/g, " ").replace(/\s*\)/g, ")");
}

function deindent(text: string) {
  return text.split("\n").reduce((buf, line) => buf + line.trim().replace(/^\(/, " ("), "");
}

const parseAndUnparse = (wat: string) => {
  return parse(wat).map(unparse).unwrap();
};
