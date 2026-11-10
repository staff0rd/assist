import type { ChildProcessWithoutNullStreams } from "node:child_process";

export function watchCodexAppServer(
	child: ChildProcessWithoutNullStreams,
	fail: (error: Error) => void,
): void {
	let stderr = "";
	child.stderr.on("data", (chunk) => {
		stderr += chunk;
	});
	child.on("error", fail);
	child.stdin.on("error", fail);
	child.on("exit", (code) =>
		fail(
			new Error(
				`codex app-server exited (${code})${stderr.trim() ? `: ${stderr.trim()}` : ""}`,
			),
		),
	);
}
