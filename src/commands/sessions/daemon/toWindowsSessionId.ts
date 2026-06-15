// Windows session ids are namespaced so they never collide with the WSL
// daemon's own ids in the merged session list seen by the UI.
const PREFIX = "w-";

export function toWindowsSessionId(id: string): string {
	return `${PREFIX}${id}`;
}

export function isWindowsSessionId(id: string): boolean {
	return id.startsWith(PREFIX);
}

export function stripWindowsSessionId(id: string): string {
	return id.startsWith(PREFIX) ? id.slice(PREFIX.length) : id;
}
