import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type AssistConfigInput,
	makeAssistConfig,
} from "../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../test/mocks/loadConfigMock";
import { codexSessionEnvArgs } from "./codexSessionEnvArgs";
import { loadConfig } from "./loadConfig";
import { spawnCodex } from "./spawnCodex";
import { spawnInherit } from "./spawnInherit";

vi.mock("./loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockLoadConfig = vi.mocked(loadConfig);

vi.mock("./spawnInherit", () => ({
	spawnInherit: vi.fn(() => ({ fake: "spawn" })),
}));

const spawnInheritMock = spawnInherit as unknown as ReturnType<typeof vi.fn>;

vi.mock("./trustCodexProject", () => ({ trustCodexProject: vi.fn() }));

vi.mock("./codexSessionEnvArgs", () => ({
	codexSessionEnvArgs: vi.fn(() => ["<session-env>"]),
}));

const prepareTrust = vi.hoisted(() => vi.fn());

vi.mock("./prepareCodexHookTrust", () => ({
	prepareCodexHookTrust: prepareTrust,
}));

const ENV = "<session-env>";

vi.mock("./codexSandboxArgs", () => ({
	codexSandboxArgs: () => ["<sandbox>"],
}));

const SANDBOX = ["<sandbox>"];

const LITELLM = { baseUrl: "https://proxy.example/", apiKey: "sk-test" };

const OVERRIDE_ARGS = [
	"-c",
	"model_providers.litellm.name=LiteLLM",
	"-c",
	"model_providers.litellm.base_url=https://proxy.example/v1",
	"-c",
	"model_providers.litellm.env_key=ASSIST_LITELLM_API_KEY",
	"-c",
	"model_providers.litellm.wire_api=responses",
	"-c",
	"model_provider=litellm",
	"-m",
	"gpt-5-codex",
];

function withConfig(config: AssistConfigInput): void {
	mockLoadConfig.mockReturnValue(
		makeAssistConfig({ harness: { engine: "claude" }, ...config }),
	);
}

describe("spawnCodex", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prepareTrust.mockReturnValue(undefined);
		withConfig({});
	});

	it("runs plain codex in the given cwd and sandbox", () => {
		spawnCodex("Do the thing", { cwd: "/repo", sandbox: "read-only" });

		expect(spawnInheritMock).toHaveBeenCalledWith(
			"codex",
			[
				"--no-daemon",
				ENV,
				...SANDBOX,
				"-C",
				"/repo",
				"--sandbox",
				"read-only",
				"Do the thing",
			],
			{ env: {} },
		);
	});

	it("resumes the given conversation with the prompt", () => {
		spawnCodex("Continue", { cwd: "/repo", resumeSessionId: "codex-1" });

		const args = spawnInheritMock.mock.calls[0][1] as string[];
		expect(args.slice(-3)).toEqual(["resume", "codex-1", "Continue"]);
	});

	it("resumes without a prompt when none is given", () => {
		spawnCodex("", { cwd: "/repo", resumeSessionId: "codex-1" });

		const args = spawnInheritMock.mock.calls[0][1] as string[];
		expect(args.slice(-2)).toEqual(["resume", "codex-1"]);
	});

	it("pins the launching env's session keys into codex's shell env", () => {
		spawnCodex("Do the thing");

		expect(codexSessionEnvArgs).toHaveBeenCalledWith(process.env);
	});

	it("defaults to the process cwd and a workspace-write sandbox", () => {
		spawnCodex("Do the thing");

		expect(spawnInheritMock).toHaveBeenCalledWith(
			"codex",
			[
				"--no-daemon",
				ENV,
				...SANDBOX,
				"-C",
				process.cwd(),
				"--sandbox",
				"workspace-write",
				"Do the thing",
			],
			{ env: {} },
		);
	});

	it("routes through LiteLLM with the key in its env when harness.codexModel is set", () => {
		withConfig({
			harness: { engine: "claude", codexModel: "gpt-5-codex" },
			litellm: LITELLM,
		});

		spawnCodex("Do the thing", { cwd: "/repo" });

		expect(spawnInheritMock).toHaveBeenCalledWith(
			"codex",
			[
				"--no-daemon",
				...OVERRIDE_ARGS,
				ENV,
				...SANDBOX,
				"-C",
				"/repo",
				"--sandbox",
				"workspace-write",
				"Do the thing",
			],
			{ env: { ASSIST_LITELLM_API_KEY: "sk-test" } },
		);
	});

	it("runs plain codex when LiteLLM is unconfigured", () => {
		withConfig({ harness: { engine: "claude", codexModel: "gpt-5-codex" } });

		spawnCodex("Do the thing", { cwd: "/repo" });

		expect(spawnInheritMock).toHaveBeenCalledWith(
			"codex",
			[
				"--no-daemon",
				ENV,
				...SANDBOX,
				"-C",
				"/repo",
				"--sandbox",
				"workspace-write",
				"Do the thing",
			],
			{ env: {} },
		);
	});

	it("neutralizes $skill mentions so quoted text cannot load a Codex skill", () => {
		spawnCodex("Earlier we ran 'codex exec $refine' with $HOME set", {
			cwd: "/repo",
		});

		const args = spawnInheritMock.mock.calls[0][1] as string[];
		expect(args.at(-1)).toBe(
			"Earlier we ran 'codex exec $⁠refine' with $HOME set",
		);
	});

	it("invokes a requested skill with a live $mention while still neutralizing its arguments", () => {
		spawnCodex("a42 mentions $draft", { cwd: "/repo", skill: "refine" });

		const args = spawnInheritMock.mock.calls[0][1] as string[];
		expect(args.at(-1)).toBe("$refine a42 mentions $⁠draft");
	});

	it("invokes a skill with no arguments", () => {
		spawnCodex("", { cwd: "/repo", skill: "draft" });

		const args = spawnInheritMock.mock.calls[0][1] as string[];
		expect(args.at(-1)).toBe("$draft");
	});

	it("ignores review.codexModel", () => {
		withConfig({ review: { codexModel: "gpt-5-codex" }, litellm: LITELLM });

		spawnCodex("Do the thing", { cwd: "/repo" });

		expect(spawnInheritMock).toHaveBeenCalledWith(
			"codex",
			[
				"--no-daemon",
				ENV,
				...SANDBOX,
				"-C",
				"/repo",
				"--sandbox",
				"workspace-write",
				"Do the thing",
			],
			{ env: {} },
		);
	});

	it.each([
		["a new session", {}],
		["a resumed session", { resumeSessionId: "codex-1" }],
	])("prepares Assist's hook trust before launching %s", (_name, extra) => {
		spawnCodex("Do the thing", { cwd: "/repo", ...extra });

		expect(prepareTrust).toHaveBeenCalledTimes(1);
		expect(prepareTrust.mock.invocationCallOrder[0]).toBeLessThan(
			spawnInheritMock.mock.invocationCallOrder[0],
		);
	});

	it("still launches with hooks enabled and no trust bypass when preparation fails", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		prepareTrust.mockReturnValue("Could not trust Assist's Codex hooks: x");

		spawnCodex("Do the thing", { cwd: "/repo" });

		expect(error).toHaveBeenCalledWith(
			"Could not trust Assist's Codex hooks: x",
		);
		const args = spawnInheritMock.mock.calls[0][1] as string[];
		expect(args.join(" ")).not.toMatch(/bypass-hook-trust|hooks.*=\s*false/);
		expect(args.at(-1)).toBe("Do the thing");
		error.mockRestore();
	});

	it("passes a chosen model as codex's own flag instead of LiteLLM routing", () => {
		withConfig({
			harness: { engine: "claude", codexModel: "gpt-5-codex" },
			litellm: LITELLM,
		});

		spawnCodex("Do the thing", { cwd: "/repo", model: "o3" });

		expect(spawnInheritMock).toHaveBeenCalledWith(
			"codex",
			[
				"--no-daemon",
				"-m",
				"o3",
				ENV,
				...SANDBOX,
				"-C",
				"/repo",
				"--sandbox",
				"workspace-write",
				"Do the thing",
			],
			{ env: {} },
		);
	});
});
