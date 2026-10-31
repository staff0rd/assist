import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import type { ClientFailure } from "../../shared/ClientFailure";
import { readJsonBody } from "../readJsonBody";
import { clientErrorsSchema } from "./clientErrorsSchema";

const KIND_LABELS = {
	error: "uncaught error",
	rejection: "unhandled rejection",
	caught: "caught error",
} as const;

function formatClientFailure(failure: ClientFailure): string {
	if (failure.kind)
		return `client: ${KIND_LABELS[failure.kind]} on ${failure.path}: ${failure.error ?? "unknown error"} at ${failure.at}`;
	const target = failure.node
		? `node=${failure.node} via ${failure.base}`
		: failure.base;
	const outcome = [
		failure.status === undefined ? undefined : `HTTP ${failure.status}`,
		failure.error,
	]
		.filter(Boolean)
		.join(" ");
	return `client: ${failure.method} ${failure.path} -> ${target} failed: ${outcome || "unknown error"} (${failure.durationMs}ms) at ${failure.at}`;
}

export async function clientErrors(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const parsed = clientErrorsSchema.safeParse(
		await readJsonBody(req).catch(() => undefined),
	);
	if (!parsed.success) {
		respondJson(res, 400, { error: "Invalid client errors body" });
		return;
	}
	for (const failure of parsed.data.failures)
		console.log(formatClientFailure(failure));
	respondJson(res, 200, { received: parsed.data.failures.length });
}
