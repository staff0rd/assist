import { describe, expect, it, vi } from "vitest";
import { workflowQueryEnv } from "../workflowQueryEnv";
import { codexSdkOptions } from "./codexSdkOptions";

vi.mock("./codexSdkExecutable", () => ({ codexSdkExecutable: () => "codex" }));
vi.mock("../../../../../shared/resolveCodexModel", () => ({
	resolveCodexModel: () => "gpt-test",
}));
vi.mock("../../codexDeveloperInstructionsArgs", () => ({
	codexDeveloperInstructionsArgs: () => [],
}));
vi.mock("../../../../../shared/codexSandboxArgs", () => ({
	codexSandboxArgs: () => [],
}));

describe("codexSdkOptions", () => {
	const options = codexSdkOptions({ sessionId: "3", cwd: "/repo" }, (base) =>
		workflowQueryEnv(base, "3", undefined),
	);

	it("runs codex with the driven-session env", () => {
		expect(options.codex.env).toMatchObject({
			ASSIST_SESSION_ID: "3",
			ASSIST_SDK_AGENT: "1",
		});
	});

	it("pins the driven-session env for the commands codex runs", () => {
		expect(options.codex.configOverrides).toEqual(
			expect.arrayContaining([
				'shell_environment_policy.set.ASSIST_SESSION_ID="3"',
				'shell_environment_policy.set.ASSIST_SDK_AGENT="1"',
			]),
		);
	});
});
