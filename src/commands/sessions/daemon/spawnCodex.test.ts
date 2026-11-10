import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../../shared/loadConfig";
import {
	type AssistConfigInput,
	makeAssistConfig,
} from "../../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../../test/mocks/loadConfigMock";
import { codexSessionEnvArgs } from "../../../shared/codexSessionEnvArgs";
import { daemonLog } from "./daemonLog";
import { spawnCodex } from "./spawnCodex";
import { spawnPty } from "./spawnPty";

vi.mock("../../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockLoadConfig = vi.mocked(loadConfig);

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({ fake: "pty" })),
}));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

vi.mock("../../../shared/trustCodexProject", () => ({
	trustCodexProject: vi.fn(),
}));

vi.mock("../../../shared/codexSessionEnvArgs", () => ({
	codexSessionEnvArgs: vi.fn(() => ["<session-env>"]),
}));

const prepareTrust = vi.hoisted(() => vi.fn());

vi.mock("../../../shared/prepareCodexHookTrust", () => ({
	prepareCodexHookTrust: prepareTrust,
}));

const ENV = "<session-env>";

const NETWORK = ["-c", "sandbox_workspace_write.network_access=true"];

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

	it("starts a fresh interactive session with a prompt", () => {
		spawnCodex({ prompt: "Do the thing", cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["codex", "--no-daemon", ENV, ...NETWORK, "Do the thing"],
			"/repo",
			"7",
			{},
		);
	});

	it("pins the session's own id into codex's shell env", () => {
		spawnCodex({ cwd: "/repo", sessionId: "7" });

		expect(codexSessionEnvArgs).toHaveBeenCalledWith(
			expect.objectContaining({ ASSIST_SESSION: "1", ASSIST_SESSION_ID: "7" }),
		);
	});

	it("starts a bare idle session with no prompt", () => {
		spawnCodex({ cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["codex", "--no-daemon", ENV, ...NETWORK],
			"/repo",
			"7",
			{},
		);
	});

	it("starts with no options", () => {
		spawnCodex();

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["codex", "--no-daemon", ENV, ...NETWORK],
			undefined,
			undefined,
			{},
		);
	});

	it("resumes a recorded conversation by id", () => {
		spawnCodex({ resumeSessionId: "conv-1", cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["codex", "--no-daemon", ENV, ...NETWORK, "resume", "conv-1"],
			"/repo",
			"7",
			{},
		);
	});

	it("passes the restart nudge as the resumed turn's prompt", () => {
		spawnCodex({
			resumeSessionId: "conv-1",
			prompt: "continue",
			cwd: "/repo",
			sessionId: "7",
		});

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["codex", "--no-daemon", ENV, ...NETWORK, "resume", "conv-1", "continue"],
			"/repo",
			"7",
			{},
		);
	});

	describe("with harness.codexModel set", () => {
		it("routes a new session through LiteLLM with the key in its env", () => {
			withConfig({
				harness: { engine: "claude", codexModel: "gpt-5-codex" },
				litellm: LITELLM,
			});

			spawnCodex({ prompt: "Do the thing", cwd: "/repo", sessionId: "7" });

			expect(spawnPtyMock).toHaveBeenCalledWith(
				[
					"codex",
					"--no-daemon",
					...OVERRIDE_ARGS,
					ENV,
					...NETWORK,
					"Do the thing",
				],
				"/repo",
				"7",
				{ ASSIST_LITELLM_API_KEY: "sk-test" },
			);
		});

		it("routes a resumed session through LiteLLM", () => {
			withConfig({
				harness: { engine: "claude", codexModel: "gpt-5-codex" },
				litellm: LITELLM,
			});

			spawnCodex({
				resumeSessionId: "conv-1",
				prompt: "continue",
				cwd: "/repo",
				sessionId: "7",
			});

			expect(spawnPtyMock).toHaveBeenCalledWith(
				[
					"codex",
					"--no-daemon",
					...OVERRIDE_ARGS,
					ENV,
					...NETWORK,
					"resume",
					"conv-1",
					"continue",
				],
				"/repo",
				"7",
				{ ASSIST_LITELLM_API_KEY: "sk-test" },
			);
		});

		it("passes a chosen model as codex's own flag instead of routing through LiteLLM", () => {
			withConfig({
				harness: { engine: "claude", codexModel: "gpt-5-codex" },
				litellm: LITELLM,
			});

			spawnCodex({ cwd: "/repo", sessionId: "7", model: "gpt-5.5" });

			expect(spawnPtyMock).toHaveBeenCalledWith(
				["codex", "--no-daemon", "-m", "gpt-5.5", ENV, ...NETWORK],
				"/repo",
				"7",
				{},
			);
		});

		it("launches plain codex when LiteLLM is unconfigured", () => {
			withConfig({ harness: { engine: "claude", codexModel: "gpt-5-codex" } });

			spawnCodex({ resumeSessionId: "conv-1", cwd: "/repo", sessionId: "7" });

			expect(spawnPtyMock).toHaveBeenCalledWith(
				["codex", "--no-daemon", ENV, ...NETWORK, "resume", "conv-1"],
				"/repo",
				"7",
				{},
			);
		});
	});

	it("appends a system prompt file as developer instructions, on resume too", () => {
		const dir = mkdtempSync(join(tmpdir(), "assist-codex-prompt-"));
		const file = join(dir, "prompt.md");
		writeFileSync(file, '# Design\n\nSay "hi" \\ then stop.\n');
		const expected = [
			"-c",
			String.raw`developer_instructions="# Design\n\nSay \"hi\" \\ then stop.\n"`,
		];

		spawnCodex({ cwd: "/repo", sessionId: "7", appendSystemPromptFile: file });
		spawnCodex({
			cwd: "/repo",
			sessionId: "7",
			resumeSessionId: "conv-1",
			appendSystemPromptFile: file,
		});

		expect(spawnPtyMock.mock.calls[0][0]).toEqual([
			"codex",
			"--no-daemon",
			ENV,
			...NETWORK,
			...expected,
		]);
		expect(spawnPtyMock.mock.calls[1][0]).toEqual([
			"codex",
			"--no-daemon",
			ENV,
			...NETWORK,
			...expected,
			"resume",
			"conv-1",
		]);
		rmSync(dir, { recursive: true, force: true });
	});

	it("ignores review.codexModel", () => {
		withConfig({ review: { codexModel: "gpt-5-codex" }, litellm: LITELLM });

		spawnCodex({ cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["codex", "--no-daemon", ENV, ...NETWORK],
			"/repo",
			"7",
			{},
		);
	});

	it.each([
		["a new session", {}],
		["a resumed session", { resumeSessionId: "conv-1" }],
	])("prepares Assist's hook trust before launching %s", (_name, extra) => {
		spawnCodex({ cwd: "/repo", sessionId: "7", ...extra });

		expect(prepareTrust).toHaveBeenCalledTimes(1);
		expect(prepareTrust.mock.invocationCallOrder[0]).toBeLessThan(
			spawnPtyMock.mock.invocationCallOrder[0],
		);
	});

	it("still launches with hooks enabled and no trust bypass when preparation fails", () => {
		prepareTrust.mockReturnValue("Could not trust Assist's Codex hooks: x");

		spawnCodex({ cwd: "/repo", sessionId: "7" });

		expect(daemonLog).toHaveBeenCalledWith(
			"codex: Could not trust Assist's Codex hooks: x",
		);
		const args = spawnPtyMock.mock.calls[0][0] as string[];
		expect(args.join(" ")).not.toMatch(/bypass-hook-trust|hooks.*=\s*false/);
		expect(args).toEqual(["codex", "--no-daemon", ENV, ...NETWORK]);
	});
});
