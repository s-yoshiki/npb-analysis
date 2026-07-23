export const THEME_STORAGE_KEY = "theme";

/**
 * Applies the stored (or system) theme before the first paint so the page never
 * flashes the wrong colour scheme. Kept as a string so it can run synchronously
 * in <head>, ahead of React hydration.
 */
const script = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export function ThemeScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time constant with no user input, and it must run before paint
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
