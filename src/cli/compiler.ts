import fs from "fs/promises";
import { parse, convertModule, unparse } from "../backend";

async function main() {
  const code = `
    (module
      (memory 1)
      (func $add (param $a i32) (param $b i32) (result i32)
        local.get $a
        local.get $b
        i32.add
      )
    )
  `;

  const mod = parse(code).mapValue(convertModule);
  const arr = unparse(mod.unwrap());
  const fname = process.argv.slice(2)[0];
  await fs.writeFile(fname, new Uint8Array(arr));
}

main();
