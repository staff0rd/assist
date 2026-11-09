// The repo the web server was started in is per-client context the daemon
// doesn't know about.
export function withRepoCwd(line: string, repoCwd?: string): string {
	if (!repoCwd) return line;
	try {
		const data = JSON.parse(line);
		if (data.type !== "sessions" || data.cwd) return line;
		data.cwd = repoCwd;
		return JSON.stringify(data);
	} catch {
		return line;
	}
}
