import { fallbackTheme, themeToCssVariables } from "@scaffold/contracts";
import type { Theme } from "@scaffold/contracts";

export function resolveThemeVariables(theme?: Theme | null): Record<string, string> {
  return themeToCssVariables(theme || fallbackTheme);
}
