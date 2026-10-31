import { markReported, wasReported } from "./markReported";
import { recordPageError } from "./recordPageError";

function describe(reason: unknown): string {
	return reason instanceof Error ? reason.message : String(reason);
}

function sourceOf(event: ErrorEvent): string {
	return event.filename
		? ` (${event.filename}:${event.lineno}:${event.colno})`
		: "";
}

function onError(event: ErrorEvent): void {
	if (wasReported(event.error)) return;
	markReported(event.error);
	recordPageError(
		"error",
		`${event.message || describe(event.error)}${sourceOf(event)}`,
	);
}

function onRejection(event: PromiseRejectionEvent): void {
	if (wasReported(event.reason)) return;
	markReported(event.reason);
	recordPageError("rejection", describe(event.reason));
}

export function captureGlobalErrors(): () => void {
	globalThis.addEventListener("error", onError);
	globalThis.addEventListener("unhandledrejection", onRejection);
	return () => {
		globalThis.removeEventListener("error", onError);
		globalThis.removeEventListener("unhandledrejection", onRejection);
	};
}
