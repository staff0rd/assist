import { describe, expect, it } from "vitest";
import { codexSdkConfig } from "./codexSdkConfig";

describe("codexSdkConfig", () => {
	it("maps codex CLI flags to SDK config overrides and thread options", () => {
		expect(
			codexSdkConfig([
				"-c",
				"model_provider=litellm",
				"-m",
				"gpt-5",
				"--add-dir",
				"/home/u/.assist",
			]),
		).toEqual({
			configOverrides: ["model_provider=litellm"],
			additionalDirectories: ["/home/u/.assist"],
			model: "gpt-5",
		});
	});

	it("refuses a flag the SDK cannot express", () => {
		expect(() => codexSdkConfig(["--no-daemon", "x"])).toThrow(
			"codex flag --no-daemon has no SDK equivalent",
		);
	});
});
