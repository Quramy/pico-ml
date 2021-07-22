import { compare } from "./comparetor";
import {
  LTOperation,
  LEOperation,
  GTOperation,
  GEOperation,
  EQOperation,
  PEQOperation,
  NEOperation,
  PNEOperation,
} from "../../syntax";

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

const eq: EQOperation = {
  kind: "Equal",
  token: {
    tokenKind: "Symbol",
    symbol: "=",
  },
};

const ne: NEOperation = {
  kind: "NotEqual",
  token: {
    tokenKind: "Symbol",
    symbol: "<>",
  },
};

const peq: PEQOperation = {
  kind: "PEqual",
  token: {
    tokenKind: "Symbol",
    symbol: "==",
  },
};

const pne: PNEOperation = {
  kind: "PNotEqual",
  token: {
    tokenKind: "Symbol",
    symbol: "!=",
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

    it("should be calc eq correctlry", () => {
      expect(compare(1, 1, eq).unwrap()).toBe(true);
      expect(compare(1, 0, eq).unwrap()).toBe(false);
      expect(compare(0, 1, eq).unwrap()).toBe(false);
    });

    it("should be calc ne correctlry", () => {
      expect(compare(1, 1, ne).unwrap()).toBe(false);
      expect(compare(1, 0, ne).unwrap()).toBe(true);
      expect(compare(0, 1, ne).unwrap()).toBe(true);
    });

    it("should be calc physical eq correctlry", () => {
      expect(compare(1, 1, peq).unwrap()).toBe(true);
      expect(compare(1, 0, peq).unwrap()).toBe(false);
      expect(compare(0, 1, peq).unwrap()).toBe(false);
    });

    it("should be calc physical ne correctlry", () => {
      expect(compare(1, 1, pne).unwrap()).toBe(false);
      expect(compare(1, 0, pne).unwrap()).toBe(true);
      expect(compare(0, 1, pne).unwrap()).toBe(true);
    });
  });

  describe("with boolean operand", () => {
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

    it("should be calc eq correctlry", () => {
      expect(compare(false, false, eq).unwrap()).toBe(true);
      expect(compare(true, true, eq).unwrap()).toBe(true);
      expect(compare(true, false, eq).unwrap()).toBe(false);
      expect(compare(false, true, eq).unwrap()).toBe(false);
    });

    it("should be calc ne correctlry", () => {
      expect(compare(false, false, ne).unwrap()).toBe(false);
      expect(compare(true, true, ne).unwrap()).toBe(false);
      expect(compare(true, false, ne).unwrap()).toBe(true);
      expect(compare(false, true, ne).unwrap()).toBe(true);
    });

    it("should be calc physical eq correctlry", () => {
      expect(compare(false, false, peq).unwrap()).toBe(true);
      expect(compare(true, true, peq).unwrap()).toBe(true);
      expect(compare(true, false, peq).unwrap()).toBe(false);
      expect(compare(false, true, peq).unwrap()).toBe(false);
    });

    it("should be calc physical ne correctlry", () => {
      expect(compare(false, false, pne).unwrap()).toBe(false);
      expect(compare(true, true, pne).unwrap()).toBe(false);
      expect(compare(true, false, pne).unwrap()).toBe(true);
      expect(compare(false, true, pne).unwrap()).toBe(true);
    });
  });

  describe("with list operand", () => {
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

    it("should be calc eq correctlry", () => {
      expect(compare([], [], eq).unwrap()).toBe(true);
      expect(compare([true], [], eq).unwrap()).toBe(false);
      expect(compare([true], [true], eq).unwrap()).toBe(true);
    });

    it("should be calc ne correctlry", () => {
      expect(compare([], [], ne).unwrap()).toBe(false);
      expect(compare([true], [], ne).unwrap()).toBe(true);
      expect(compare([true], [true], ne).unwrap()).toBe(false);
    });

    it("should be calc physical eq correctlry", () => {
      expect(compare([], [], peq).unwrap()).toBe(true);
      expect(compare([true], [], peq).unwrap()).toBe(false);
      expect(compare([true], [true], peq).unwrap()).toBe(false);
    });

    it("should be calc physical ne correctlry", () => {
      expect(compare([], [], pne).unwrap()).toBe(false);
      expect(compare([true], [], pne).unwrap()).toBe(true);
      expect(compare([true], [true], pne).unwrap()).toBe(true);
    });
  });
});
