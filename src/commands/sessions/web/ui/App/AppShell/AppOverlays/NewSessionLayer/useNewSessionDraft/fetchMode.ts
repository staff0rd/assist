import { apiFetch } from "../../../../../apiFetch";
import { reportCaughtError } from "../../../../../clientFailures/reportCaughtError";
import { type NewSessionMode, newSessionModes } from "../newSessionModes";
import { type ModeHarnesses, parseModeHarnesses } from "./parseModeHarnesses";
import { type ModeModels, parseModeModels } from "./parseModeModels";

export type Outcome =
	| { mode: NewSessionMode; harnesses: ModeHarnesses; models: ModeModels }
	| { error: string };

async function failureMessage(res: Response): Promise<string> {
	const status = `HTTP ${res.status}`;
	const body = await res.json().catch(() => null);
	return typeof body?.error === "string" ? `${status}: ${body.error}` : status;
}

export async function fetchMode(cwd: string): Promise<Outcome> {
	try {
		const query = cwd ? `?cwd=${encodeURIComponent(cwd)}` : "";
		const res = await apiFetch(`/api/new-session-defaults${query}`);
		if (!res.ok) return { error: await failureMessage(res) };
		const body = await res.json();
		if (Object.hasOwn(newSessionModes, body?.mode))
			return {
				mode: body.mode,
				harnesses: parseModeHarnesses(body.harnesses),
				models: parseModeModels(body.models),
			};
		throw new Error(`unknown mode ${JSON.stringify(body?.mode)}`);
	} catch (error) {
		reportCaughtError(error, "new-session defaults");
		return { error: error instanceof Error ? error.message : String(error) };
	}
}
