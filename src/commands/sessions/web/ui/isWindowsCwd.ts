// why: a Windows cwd looks like C:\Users\me\repo or C:/Users/me/repo. Mirrors
// the daemon's isWindowsCwd but stays free of node-only imports for the browser.
export function isWindowsCwd(cwd: string | undefined): boolean {
	return !!cwd && /^[A-Za-z]:[\\/]/.test(cwd);
}
