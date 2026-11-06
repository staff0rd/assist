import { describe, expect, it } from "vitest";
import { codexSessionEnvArgs } from "./codexSessionEnvArgs";

describe("codexSessionEnvArgs", () => {
	it("pins each session key to the launching env's value", () => {
		expect(
			codexSessionEnvArgs({
				ASSIST_SESSION: "1",
				ASSIST_SESSION_ID: "6",
				ASSIST_BACKLOG_ITEM_ID: "667",
			}),
		).toEqual([
			"-c",
			'shell_environment_policy.set.ASSIST_SESSION="1"',
			"-c",
			'shell_environment_policy.set.ASSIST_SESSION_ID="6"',
			"-c",
			'shell_environment_policy.set.ASSIST_BACKLOG_ITEM_ID="667"',
		]);
	});

	it("blanks keys the launching env lacks so a shared app-server's values do not leak", () => {
		expect(codexSessionEnvArgs({})).toEqual([
			"-c",
			'shell_environment_policy.set.ASSIST_SESSION=""',
			"-c",
			'shell_environment_policy.set.ASSIST_SESSION_ID=""',
			"-c",
			'shell_environment_policy.set.ASSIST_BACKLOG_ITEM_ID=""',
		]);
	});
});
