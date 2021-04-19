import fs from "fs/promises";
import { parse, convertModule, unparse } from "../backend";

async function main() {
  const code = `
  (module
    (memory $mem 1)
    (type $type1 (func (param $a i32) (result i32)))
  )
  `;

  const mod = parse(code).map(convertModule).unwrap();
  const arr = unparse(mod);
  const fname = process.argv.slice(2)[0];
  await fs.writeFile(fname, new Uint8Array(arr));
}

main();
