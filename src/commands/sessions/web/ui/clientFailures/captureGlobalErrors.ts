import { markReported, wasReported } from "./markReported";
import { recordClientFailure } from "./recordClientFailure";

function describe(reason: unknown): string {
	return reason instanceof Error ? reason.message : String(reason);
}

function sourceOf(event: ErrorEvent): string {
	return event.filename
		? ` (${event.filename}:${event.lineno}:${event.colno})`
		: "";
}

function record(kind: "error" | "rejection", error: string): void {
	recordClientFailure({
		at: new Date().toISOString(),
		kind,
		method: kind === "error" ? "ERROR" : "REJECT",
		path: location.pathname + location.search,
		base: location.origin,
		error,
		durationMs: 0,
	});
}

function onError(event: ErrorEvent): void {
	if (wasReported(event.error)) return;
	markReported(event.error);
	record(
		"error",
		`${event.message || describe(event.error)}${sourceOf(event)}`,
	);
}

function onRejection(event: PromiseRejectionEvent): void {
	if (wasReported(event.reason)) return;
	markReported(event.reason);
	record("rejection", describe(event.reason));
}

export function captureGlobalErrors(): () => void {
	globalThis.addEventListener("error", onError);
	globalThis.addEventListener("unhandledrejection", onRejection);
	return () => {
		globalThis.removeEventListener("error", onError);
		globalThis.removeEventListener("unhandledrejection", onRejection);
	};
}
