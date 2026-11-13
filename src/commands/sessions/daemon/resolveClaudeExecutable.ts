import { execFileSync } from "node:child_process";

const opts = {
	encoding: "utf8" as const,
	stdio: ["ignore", "pipe", "ignore"] as ["ignore", "pipe", "ignore"],
	windowsHide: true,
};

/* why: terminal sessions run claude through the user's login shell, so the
 * SDK child must find the same installed claude rather than the SDK's bundled
 * binary, which would not share the user's login and version. */
export function resolveClaudeExecutable(): string {
	const found =
		process.platform === "win32"
			? execFileSync("where", ["claude"], opts)
			: execFileSync(
					process.env.SHELL ?? "bash",
					["-l", "-c", "command -v claude"],
					opts,
				);
	const lines = found
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => /^(\/|[A-Za-z]:\\)/.test(line));
	const path = lines.find((line) => line.endsWith(".exe")) ?? lines.at(-1);
	if (!path) throw new Error("claude is not on PATH");
	return path;
}
