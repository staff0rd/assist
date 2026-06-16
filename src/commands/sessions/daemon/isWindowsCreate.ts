import { shouldProxyToWindows } from "./isWindowsCwd";
import { isWindowsSessionId } from "./toWindowsSessionId";

type Msg = Record<string, unknown>;

// A create/resume in a windows-origin cwd is forwarded to the Windows daemon.
export function isWindowsCreate(data: Msg): boolean {
	return typeof data.cwd === "string" && shouldProxyToWindows(data.cwd);
}

// I/O for a namespaced session id belongs to a proxied Windows session.
export function isWindowsIo(data: Msg): boolean {
	return (
		typeof data.sessionId === "string" && isWindowsSessionId(data.sessionId)
	);
}
