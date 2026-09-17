import { isGhNotInstalled } from "../shared";

function firstLine(text: string): string | null {
	const line = text
		.split("\n")
		.map((candidate) => candidate.trim())
		.find((candidate) => candidate.length > 0);
	return line ?? null;
}

function stderrText(error: unknown): string | null {
	const stderr = (error as { stderr?: unknown })?.stderr;
	if (typeof stderr === "string") return firstLine(stderr);
	if (stderr instanceof Uint8Array) {
		return firstLine(Buffer.from(stderr).toString("utf8"));
	}
	return null;
}

export function describeFetchError(error: unknown): string {
	if (isGhNotInstalled(error)) {
		return "GitHub CLI (gh) is not installed — see https://cli.github.com/";
	}
	const stderr = stderrText(error);
	if (stderr) return stderr;
	if (error instanceof Error) return firstLine(error.message) ?? error.message;
	return String(error);
}
