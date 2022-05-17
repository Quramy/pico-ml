const HEX_STRING = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

export function toHex(num: number, l: number) {
  let str = "";
  if (num < 0) return "";
  do {
    str = HEX_STRING[num & 0xf] + str;
    num = num >> 4;
  } while (num);
  return str.padStart(l, "0");
}
