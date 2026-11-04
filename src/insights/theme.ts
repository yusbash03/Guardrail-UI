import { studioTheme } from 'ag-studio';

/** Reads a design token (index.css, "H S% L%") as a concrete colour. Charts draw on canvas, so CSS vars won't do. */
function token(name: string, alpha?: number): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  return alpha === undefined ? `hsl(${value})` : `hsl(${value} / ${alpha})`;
}

/**
 * Guardrail theme for AG Studio (AG_GRID_USAGE.md §2.4): DESIGN_SYSTEM.md tokens — Inter, indigo primary,
 * teal/amber/red decision colours, 14 px cards. Built from the current light/dark tokens; rebuild on theme change.
 */
export function guardrailStudioTheme(dark: boolean) {
  return studioTheme.withParams({
    browserColorScheme: dark ? 'dark' : 'light',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
    backgroundColor: token('background'),
    foregroundColor: token('foreground'),
    accentColor: token('primary'),
    borderColor: token('border'),
    widgetBorderRadius: 14,
    ...palette(),
  } as Parameters<typeof studioTheme.withParams>[0]);
}

/** Decision palette for charts: indigo, teal (allowed), amber (approval), red (blocked), then neutrals. */
function palette() {
  const colours = [token('primary'), token('accent'), token('approval'), token('blocked'), token('pending'), token('primary-ink')];
  return Object.fromEntries(
    colours.flatMap((c, i) => [[`chartPaletteFills${i + 1}Color`, c], [`chartPaletteStrokes${i + 1}Color`, c]])
  );
}

/** Concrete colours for the Guardrail custom widgets (they render their own SVG). */
export function widgetColors() {
  return {
    primary: token('primary'),
    accent: token('accent'),
    approval: token('approval'),
    blocked: token('blocked'),
    pending: token('pending'),
    track: token('track'),
    muted: token('muted-foreground'),
    foreground: token('foreground'),
  };
}
