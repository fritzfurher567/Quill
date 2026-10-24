/** Theme storage shared by the inline no-flash script and the toggle. */

export const THEME_STORAGE_KEY = "quill-theme";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/**
 * Runs in <head> before first paint (see layout.tsx). It resolves the stored
 * choice, falling back to the operating-system setting on a first visit, and
 * sets data-theme so the page never flashes the wrong colours. Every storage
 * access is guarded because storage can be unavailable or blocked.
 */
export const themeInitScript = `(function(){var d=document.documentElement,t;try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(s==="light"||s==="dark")t=s}catch(e){}if(!t){try{t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){t="light"}}d.dataset.theme=t})();`;
