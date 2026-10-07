import type { Harness } from "../ReviewerModels";
import { reviewCiHarnesses } from "./reviewCiVariables";

export type ReviewCiSlot = { harness: Harness; model: string };

function isHarness(value: string): value is Harness {
	return (reviewCiHarnesses as readonly string[]).includes(value);
}

export function parseSlot(key: string, value: string): ReviewCiSlot | string {
	const separator = value.indexOf(":");
	const harness = value.slice(0, separator).trim();
	const model = value.slice(separator + 1).trim();
	if (separator === -1 || !isHarness(harness) || !model)
		return `${key} "${value}" must be ${reviewCiHarnesses.map((h) => `${h}:<model>`).join(" or ")}`;
	return { harness, model };
}
