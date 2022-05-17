import { Scanner } from "./scanner";

describe(Scanner, () => {
  it("should skip comment correctly", () => {
    expect(new Scanner(" (* comment *)b").consume(0).pos).toBe(" (* comment *)".length);
    expect(new Scanner("(* comment *) b").consume(0).pos).toBe("(* comment *) ".length);
    expect(new Scanner("(* (* comment *) *) b").consume(0).pos).toBe("(* (* comment *) *) ".length);
    expect(new Scanner("(* comment *) (* comment *) b").consume(0).pos).toBe("(* comment *) (* comment *) ".length);
  });
});
