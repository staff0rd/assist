import type { IncomingMessage, ServerResponse } from "node:http";
import { loadMergedRawConfig } from "../../../shared/loadConfigFrom";
import { assistConfigSchema } from "../../../shared/types";
import { respondJson } from "../../../shared/web";
import { resolveDialogHarnesses } from "./newSessionDefaults/resolveDialogHarnesses";

const newSessionModeSchema =
	assistConfigSchema.shape.sessions.unwrap().shape.newSessionMode;

function configuredMode(raw: Record<string, unknown>): unknown {
	const sessions = raw.sessions;
	if (!sessions || typeof sessions !== "object") return undefined;
	return (sessions as Record<string, unknown>).newSessionMode;
}

export function newSessionDefaults(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	const url = new URL(req.url ?? "/", "http://localhost");
	const cwd = url.searchParams.get("cwd") ?? process.cwd();
	let raw: Record<string, unknown>;
	try {
		raw = loadMergedRawConfig(cwd);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		respondJson(res, 500, { error: `Couldn't read config: ${message}` });
		return;
	}
	const parsed = newSessionModeSchema.safeParse(configuredMode(raw));
	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message ?? "invalid value";
		respondJson(res, 422, {
			error: `Invalid config sessions.newSessionMode: ${message}`,
		});
		return;
	}
	const resolved = resolveDialogHarnesses(raw);
	if ("error" in resolved) {
		respondJson(res, 422, { error: `Invalid config ${resolved.error}` });
		return;
	}
	respondJson(res, 200, { mode: parsed.data, harnesses: resolved.harnesses });
}
