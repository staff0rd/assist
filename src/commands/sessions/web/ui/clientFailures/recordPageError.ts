import type { ClientFailure } from "../../../shared/ClientFailure";
import { recordClientFailure } from "./recordClientFailure";

const METHODS = { error: "ERROR", rejection: "REJECT", caught: "CAUGHT" };

export function recordPageError(
	kind: NonNullable<ClientFailure["kind"]>,
	error: string,
): void {
	recordClientFailure({
		at: new Date().toISOString(),
		kind,
		method: METHODS[kind],
		path: location.pathname + location.search,
		base: location.origin,
		error,
		durationMs: 0,
	});
}
