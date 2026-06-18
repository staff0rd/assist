import { z } from "zod";
import { loadJson, saveJson } from "../../../shared/loadJson";

const ACTIVE_FILE = "active.json";

const activeSelectionSchema = z.record(z.string(), z.string());

/** Per-repo (cwd → sessionId) selections persisted alongside sessions.json. */
export function loadActiveSelection(): Record<string, string> {
	const parsed = activeSelectionSchema.safeParse(
		loadJson<Record<string, unknown>>(ACTIVE_FILE),
	);
	return parsed.success ? parsed.data : {};
}

export function saveActiveSelection(active: Record<string, string>): void {
	saveJson(ACTIVE_FILE, active);
}
