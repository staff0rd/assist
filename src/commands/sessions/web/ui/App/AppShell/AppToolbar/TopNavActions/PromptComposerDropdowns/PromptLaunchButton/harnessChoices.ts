import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";

export function harnessChoices(capabilities: {
	exposeCodexActions: boolean;
	exposePiActions: boolean;
}): HarnessKind[] {
	const choices: HarnessKind[] = ["claude"];
	if (capabilities.exposeCodexActions) choices.push("codex");
	if (capabilities.exposePiActions) choices.push("pi");
	return choices;
}
