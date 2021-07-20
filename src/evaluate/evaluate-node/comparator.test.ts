import { compare } from "./comparetor";
import { LTOperation, LEOperation, GTOperation, GEOperation } from "../../syntax";

const lt: LTOperation = {
  kind: "LessThan",
  token: {
    tokenKind: "Symbol",
    symbol: "<",
  },
};

const le: LEOperation = {
  kind: "LessEqualThan",
  token: {
    tokenKind: "Symbol",
    symbol: "<=",
  },
};

const gt: GTOperation = {
  kind: "GreaterThan",
  token: {
    tokenKind: "Symbol",
    symbol: ">",
  },
};

const ge: GEOperation = {
  kind: "GreaterEqualThan",
  token: {
    tokenKind: "Symbol",
    symbol: ">=",
  },
};

describe(compare, () => {
  describe("with number operand", () => {
    it("should be calc lt correctlry", () => {
      expect(compare(1, 1, lt).unwrap()).toBe(false);
      expect(compare(1, 0, lt).unwrap()).toBe(false);
      expect(compare(0, 1, lt).unwrap()).toBe(true);
    });

    it("should be calc le correctlry", () => {
      expect(compare(1, 1, le).unwrap()).toBe(true);
      expect(compare(1, 0, le).unwrap()).toBe(false);
      expect(compare(0, 1, le).unwrap()).toBe(true);
    });

    it("should be calc gt correctlry", () => {
      expect(compare(1, 1, gt).unwrap()).toBe(false);
      expect(compare(1, 0, gt).unwrap()).toBe(true);
      expect(compare(0, 1, gt).unwrap()).toBe(false);
    });

    it("should be calc ge correctlry", () => {
      expect(compare(1, 1, ge).unwrap()).toBe(true);
      expect(compare(1, 0, ge).unwrap()).toBe(true);
      expect(compare(0, 1, ge).unwrap()).toBe(false);
    });
  });

  describe("with boolean comparison", () => {
    it("should be calc lt correctlry", () => {
      expect(compare(false, false, lt).unwrap()).toBe(false);
      expect(compare(true, true, lt).unwrap()).toBe(false);
      expect(compare(true, false, lt).unwrap()).toBe(false);
      expect(compare(false, true, lt).unwrap()).toBe(true);
    });

    it("should be calc le correctlry", () => {
      expect(compare(false, false, le).unwrap()).toBe(true);
      expect(compare(true, true, le).unwrap()).toBe(true);
      expect(compare(true, false, le).unwrap()).toBe(false);
      expect(compare(false, true, le).unwrap()).toBe(true);
    });

    it("should be calc gt correctlry", () => {
      expect(compare(false, false, gt).unwrap()).toBe(false);
      expect(compare(true, true, gt).unwrap()).toBe(false);
      expect(compare(true, false, gt).unwrap()).toBe(true);
      expect(compare(false, true, gt).unwrap()).toBe(false);
    });

    it("should be calc ge correctlry", () => {
      expect(compare(false, false, ge).unwrap()).toBe(true);
      expect(compare(true, true, ge).unwrap()).toBe(true);
      expect(compare(true, false, ge).unwrap()).toBe(true);
      expect(compare(false, true, ge).unwrap()).toBe(false);
    });
  });

  describe("with list comparison", () => {
    it("should be calc lt correctlry", () => {
      expect(compare([false], [], lt).unwrap()).toBe(false);
      expect(compare([false], [false], lt).unwrap()).toBe(false);
      expect(compare([true], [false], lt).unwrap()).toBe(false);
      expect(compare([], [false], lt).unwrap()).toBe(true);
      expect(compare([false, true], [true], lt).unwrap()).toBe(true);
    });

    it("should be calc le correctlry", () => {
      expect(compare([false], [], le).unwrap()).toBe(false);
      expect(compare([false], [false], le).unwrap()).toBe(true);
      expect(compare([true], [false], le).unwrap()).toBe(false);
      expect(compare([], [false], le).unwrap()).toBe(true);
      expect(compare([false, true], [true], le).unwrap()).toBe(true);
    });

    it("should be calc gt correctlry", () => {
      expect(compare([], [false], gt).unwrap()).toBe(false);
      expect(compare([false], [false], gt).unwrap()).toBe(false);
      expect(compare([false], [true], gt).unwrap()).toBe(false);
      expect(compare([false], [], gt).unwrap()).toBe(true);
      expect(compare([true], [false, true], gt).unwrap()).toBe(true);
    });

    it("should be calc ge correctlry", () => {
      expect(compare([], [false], ge).unwrap()).toBe(false);
      expect(compare([false], [false], ge).unwrap()).toBe(true);
      expect(compare([false], [true], ge).unwrap()).toBe(false);
      expect(compare([false], [], ge).unwrap()).toBe(true);
      expect(compare([true], [false, true], ge).unwrap()).toBe(true);
    });
  });
});
