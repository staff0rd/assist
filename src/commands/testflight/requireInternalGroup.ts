import type { TestflightConfig } from "./readTestflightConfig";
import { TestflightError } from "./TestflightError";
import { testflightConfigHelp } from "./testflightConfigHelp";

export function requireInternalGroup(config: TestflightConfig): string {
	if (config.internalGroup) return config.internalGroup;
	const entry = testflightConfigHelp.find(
		(help) => help.key === "testflight.internalGroup",
	);
	throw new TestflightError(
		`testflight.internalGroup is not set. Set it with: ${entry?.setter}`,
	);
}
