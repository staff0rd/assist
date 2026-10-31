import type { ClientFailure } from "../../../../../../shared/ClientFailure";

function hostOf(base: string): string {
	try {
		return new URL(base).host;
	} catch {
		return base;
	}
}

export function describeClientFailure(failure: ClientFailure) {
	return {
		time: new Date(failure.at).toLocaleTimeString(),
		method: failure.method,
		path: failure.path,
		node: failure.node ?? hostOf(failure.base),
		outcome:
			[
				failure.status === undefined ? undefined : String(failure.status),
				failure.error,
			]
				.filter(Boolean)
				.join(" ") || "unknown error",
		duration: failure.kind ? "" : `${failure.durationMs}ms`,
	};
}
