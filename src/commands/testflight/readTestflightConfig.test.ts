import { describe, expect, it } from "vitest";
import type { AssistConfig } from "../../shared/types";
import { readTestflightConfig } from "./readTestflightConfig";

describe("readTestflightConfig", () => {
	it("lists each missing key with its setter", () => {
		const config = { testflight: { keyId: "K" } } as AssistConfig;

		expect(() => readTestflightConfig(config)).toThrow(
			/testflight\.issuerId is not set\. Set it with: assist config set testflight\.issuerId/,
		);
	});
});
