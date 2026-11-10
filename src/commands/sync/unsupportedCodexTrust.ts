import { CodexRpcError } from "./CodexRpcError";
import type { HooksListResult } from "./selectAssistCodexHooks";

const METHOD_NOT_FOUND = -32601;
const FALLBACK =
	"Codex will ask you to review Assist's hooks on its next launch; choose Review hooks and trust only the `assist codex-hook` entries.";

export function unsupportedCodexTrust(error: unknown): Error {
	const detail = error instanceof Error ? error.message : String(error);
	const upgrade =
		error instanceof CodexRpcError &&
		(error.code === METHOD_NOT_FOUND || error.method === "initialize")
			? " This Codex CLI cannot grant selective hook trust; upgrade it with `codex update` and rerun `assist sync`."
			: "";
	return new Error(`${detail}.${upgrade} ${FALLBACK}`);
}

export function describeMissingCodexHooks(
	data: HooksListResult["data"],
): string {
	const problems = data.flatMap((entry) => [
		...entry.errors.map((e) => `${e.path}: ${e.message}`),
		...entry.warnings,
	]);
	return `${problems.length ? ` Codex reported: ${problems.join("; ")}.` : ""} ${FALLBACK}`;
}
