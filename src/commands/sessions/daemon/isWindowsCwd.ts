import { detectPlatform } from "../../../lib/detectPlatform";

// why: a Windows cwd looks like C:\Users\me\repo or C:/Users/me/repo
export function isWindowsCwd(cwd: string): boolean {
	return /^[A-Za-z]:[\\/]/.test(cwd);
}

// Only the WSL daemon proxies to a native Windows daemon; a daemon running
// natively on Windows drives C:\ repos with its own PTY.
export function shouldProxyToWindows(cwd: string): boolean {
	return detectPlatform() === "wsl" && isWindowsCwd(cwd);
}
