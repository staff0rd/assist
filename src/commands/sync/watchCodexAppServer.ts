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
	/* why: a codex that exits at startup also breaks the stdin pipe (EPIPE), and
	 * that error can arrive first; the exit handler carries the real cause. */
	child.stdin.on("error", () => {});
	child.on("exit", (code) =>
		fail(
			new Error(
				`codex app-server exited (${code})${stderr.trim() ? `: ${stderr.trim()}` : ""}`,
			),
		),
	);
}
