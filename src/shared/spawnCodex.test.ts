import { beforeEach, describe, expect, it, vi } from "vitest";
import { spawnCodex } from "./spawnCodex";
import { spawnInherit } from "./spawnInherit";
import type { AssistConfig } from "./types";

const mockLoadConfig = vi.fn();

vi.mock("./loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

vi.mock("./spawnInherit", () => ({
	spawnInherit: vi.fn(() => ({ fake: "spawn" })),
}));

const spawnInheritMock = spawnInherit as unknown as ReturnType<typeof vi.fn>;

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

function withConfig(config: Partial<AssistConfig>): void {
	mockLoadConfig.mockReturnValue({ harness: { engine: "claude" }, ...config });
}

describe("spawnCodex", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		withConfig({});
	});

	it("runs plain codex in the given cwd and sandbox", () => {
		spawnCodex("Do the thing", { cwd: "/repo", sandbox: "read-only" });

		expect(spawnInheritMock).toHaveBeenCalledWith(
			"codex",
			["-C", "/repo", "--sandbox", "read-only", "Do the thing"],
			{ env: {} },
		);
	});

	it("defaults to the process cwd and a workspace-write sandbox", () => {
		spawnCodex("Do the thing");

		expect(spawnInheritMock).toHaveBeenCalledWith(
			"codex",
			["-C", process.cwd(), "--sandbox", "workspace-write", "Do the thing"],
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
				...OVERRIDE_ARGS,
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
			["-C", "/repo", "--sandbox", "workspace-write", "Do the thing"],
			{ env: {} },
		);
	});

	it("ignores review.codexModel", () => {
		withConfig({ review: { codexModel: "gpt-5-codex" }, litellm: LITELLM });

		spawnCodex("Do the thing", { cwd: "/repo" });

		expect(spawnInheritMock).toHaveBeenCalledWith(
			"codex",
			["-C", "/repo", "--sandbox", "workspace-write", "Do the thing"],
			{ env: {} },
		);
	});
});
