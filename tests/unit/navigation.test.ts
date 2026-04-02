import { describe, it, expect } from "vitest";
import { nextStep, prevStep, nextButtonLabel } from "@/lib/navigation";

const user = "bobi";
const params = "subject=bio&lesson=5";

describe("nextStep", () => {
  it("advances to next card within same module", () => {
    expect(nextStep(user, 1, 1, params)).toBe("/bobi/lesson/1/2?subject=bio&lesson=5");
    expect(nextStep(user, 2, 3, params)).toBe("/bobi/lesson/2/4?subject=bio&lesson=5");
    expect(nextStep(user, 4, 4, params)).toBe("/bobi/lesson/4/5?subject=bio&lesson=5");
  });

  it("goes to separator after last card of module 1", () => {
    expect(nextStep(user, 1, 5, params)).toBe(
      "/bobi/lesson/separator?from=1&to=2&subject=bio&lesson=5"
    );
  });

  it("goes to module 3 card 1 after last card of module 2", () => {
    expect(nextStep(user, 2, 5, params)).toBe("/bobi/lesson/3/1?subject=bio&lesson=5");
  });

  it("goes to separator after last card of module 3", () => {
    expect(nextStep(user, 3, 5, params)).toBe(
      "/bobi/lesson/separator?from=3&to=4&subject=bio&lesson=5"
    );
  });

  it("goes to done after last card of module 4", () => {
    expect(nextStep(user, 4, 5, params)).toBe("/bobi/done?subject=bio&lesson=5");
  });

  it("goes to done with mode=review prefix when in review mode", () => {
    const reviewParams = "subject=bio&lesson=5&mode=review";
    const result = nextStep(user, 4, 5, reviewParams);
    expect(result).toContain("/bobi/done");
    expect(result).toContain("mode=review");
  });

  it("returns home for unknown module", () => {
    expect(nextStep(user, 5, 5, params)).toBe("/bobi");
  });
});

describe("prevStep", () => {
  it("goes to previous card within same module", () => {
    expect(prevStep(user, 1, 3, params)).toBe("/bobi/lesson/1/2?subject=bio&lesson=5");
    expect(prevStep(user, 2, 5, params)).toBe("/bobi/lesson/2/4?subject=bio&lesson=5");
  });

  it("returns home from module 1 card 1", () => {
    expect(prevStep(user, 1, 1, params)).toBe("/bobi");
  });

  it("goes to separator from module 2 card 1", () => {
    expect(prevStep(user, 2, 1, params)).toBe(
      "/bobi/lesson/separator?from=1&to=2&subject=bio&lesson=5"
    );
  });

  it("goes to module 2 card 5 from module 3 card 1", () => {
    expect(prevStep(user, 3, 1, params)).toBe("/bobi/lesson/2/5?subject=bio&lesson=5");
  });

  it("goes to separator from module 4 card 1", () => {
    expect(prevStep(user, 4, 1, params)).toBe(
      "/bobi/lesson/separator?from=3&to=4&subject=bio&lesson=5"
    );
  });

  it("returns home for unknown module", () => {
    expect(prevStep(user, 5, 1, params)).toBe("/bobi");
  });
});

describe("nextButtonLabel", () => {
  it("shows Напред → for non-last cards", () => {
    expect(nextButtonLabel(1, 1, false)).toBe("Напред →");
    expect(nextButtonLabel(2, 3, false)).toBe("Напред →");
    expect(nextButtonLabel(3, 5, false)).toBe("Напред →");
  });

  it("shows Провери дали запомни → on last card of module 2 (non-review)", () => {
    expect(nextButtonLabel(2, 5, false)).toBe("Провери дали запомни →");
  });

  it("shows Провери дали запомни → on last card of module 4 (non-review)", () => {
    expect(nextButtonLabel(4, 5, false)).toBe("Провери дали запомни →");
  });

  it("shows Напред → in review mode regardless of card position", () => {
    expect(nextButtonLabel(2, 5, true)).toBe("Напред →");
    expect(nextButtonLabel(4, 5, true)).toBe("Напред →");
  });
});
