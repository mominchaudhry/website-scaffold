import { fallbackTheme, themeToCssVariables } from "@scaffold/contracts";
import { describe, expect, it } from "vitest";

describe("themeToCssVariables", () => {
  it("returns css variable map", () => {
    const vars = themeToCssVariables(fallbackTheme);

    expect(vars["--color-bg"]).toBe(fallbackTheme.colors.background);
    expect(vars["--font-heading"]).toBe(fallbackTheme.typography.fontFamilyHeading);
  });
});
