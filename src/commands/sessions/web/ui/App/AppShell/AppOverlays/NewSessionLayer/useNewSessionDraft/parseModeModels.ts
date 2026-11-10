import { type NewSessionMode, newSessionModes } from "../newSessionModes";

export type ModeModels = Partial<Record<NewSessionMode, string>>;

export function parseModeModels(value: unknown): ModeModels {
	if (!value || typeof value !== "object") return {};
	const models: ModeModels = {};
	for (const [mode, model] of Object.entries(value)) {
		if (Object.hasOwn(newSessionModes, mode) && typeof model === "string")
			models[mode as NewSessionMode] = model;
	}
	return models;
}
