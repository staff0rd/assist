import { apiUrl } from "../apiUrl";
import { recordClientFailure } from "./recordClientFailure";

type Outcome = { status?: number; error?: string };

function nodeOf(path: string): string | undefined {
	return new URL(path, "http://local").searchParams.get("node") ?? undefined;
}

export function requestFailureRecorder(
	path: string,
	method: string | undefined,
	capture: boolean,
): (outcome: Outcome) => void {
	const started = Date.now();
	return (outcome) => {
		if (!capture) return;
		recordClientFailure({
			at: new Date(started).toISOString(),
			method: (method ?? "GET").toUpperCase(),
			path,
			base: apiUrl("") || location.origin,
			node: nodeOf(path),
			durationMs: Date.now() - started,
			...outcome,
		});
	};
}
