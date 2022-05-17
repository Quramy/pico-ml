import { Scanner } from "./scanner";
describe(Scanner, () => {
  it("should skip line comment correctly", () => {
    expect(new Scanner(" ;; comment\nfoo").consume(0).pos).toBe(" ;; comment".length + 1);
    expect(new Scanner(";; comment;; comment \nfoo").consume(0).pos).toBe(";; comment;; comment ".length + 1);
  });

  it("should skip block comment correctly", () => {
    expect(new Scanner("(; comment ;) foo").consume(0).pos).toBe("(; comment ;) ".length);
    expect(new Scanner(" (; comment ;)foo").consume(0).pos).toBe(" (; comment ;)".length);
    expect(new Scanner("(; comment ;) (; comment ;)foo").consume(0).pos).toBe("(; comment ;) (; comment ;)".length);
  });

  it("should skip complex comments  correctly", () => {
    expect(new Scanner("(; comment ;) ;; comment\nfoo").consume(0).pos).toBe("(; comment ;) ;; comment".length + 1);
  });
});
