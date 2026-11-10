import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import { harnessModels } from "../../../../../../../../shared/harnessModels";
import { type NewSessionMode, picksModel } from "./newSessionModes";

export type ModelPick = { harness: HarnessKind; model?: string };

export type SessionModel = {
	model: string | undefined;
	models: string[];
	pick: (model: string | undefined) => void;
};

export function sessionModel(
	mode: NewSessionMode,
	harness: HarnessKind,
	picked: ModelPick | undefined,
	configured: ModelPick | undefined,
	setPicked: (pick: ModelPick) => void,
): SessionModel | undefined {
	if (!picksModel(mode)) return undefined;
	const configuredModel =
		configured?.harness === harness ? configured.model : undefined;
	const model = picked?.harness === harness ? picked.model : configuredModel;
	const builtIn = harnessModels[harness];
	const extra = [configuredModel, model].filter(
		(m): m is string => !!m && !builtIn.includes(m),
	);
	return {
		model,
		models: [...new Set([...builtIn, ...extra])],
		pick: (next) => setPicked({ harness, model: next }),
	};
}
