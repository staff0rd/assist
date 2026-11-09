import type { AssistConfig } from "../../shared/types";
import { TestflightError } from "./TestflightError";
import { testflightConfigHelp } from "./testflightConfigHelp";

export type TestflightConfig = {
	keyId: string;
	issuerId: string;
	keyRef: string;
	account?: string;
	bundleId: string;
	externalGroup: string;
	internalGroup?: string;
};

const requiredKeys = [
	"keyId",
	"issuerId",
	"keyRef",
	"bundleId",
	"externalGroup",
] as const;

export function readTestflightConfig(config: AssistConfig): TestflightConfig {
	const testflight = config.testflight ?? {};
	const missing = requiredKeys.filter((key) => !testflight[key]);
	if (missing.length > 0) {
		const lines = missing.map((key) => {
			const entry = testflightConfigHelp.find(
				(help) => help.key === `testflight.${key}`,
			);
			return `  testflight.${key} is not set. Set it with: ${entry?.setter}`;
		});
		throw new TestflightError(
			["TestFlight is not configured", ...lines].join("\n"),
		);
	}
	return testflight as TestflightConfig;
}
