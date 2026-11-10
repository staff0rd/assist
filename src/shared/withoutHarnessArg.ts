import { harnessKinds } from "./harnessKinds";
import type { ReviewButtonMode } from "./reviewButtonModes";

export function withoutHarnessArg(
	mode: ReviewButtonMode,
	rest: string[],
): string[] | undefined {
	if (rest[0] !== "--harness") return rest;
	if (!mode.featureId) return undefined;
	return (harnessKinds as readonly string[]).includes(rest[1])
		? rest.slice(2)
		: undefined;
}
