import type { Choice } from "./ChoiceItem";
import type { SessionModel } from "../../../sessionModel";

export function modelChoices(model: SessionModel): Choice[] {
	return [undefined, ...model.models].map((choice) => ({
		key: `model:${choice ?? ""}`,
		label: choice ?? "Default",
		checked: choice === model.model,
		pick: () => model.pick(choice),
	}));
}
