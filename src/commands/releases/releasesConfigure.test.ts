import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSpawnClaude = vi.fn(() => ({ done: Promise.resolve(0) }));
const mockLoadConfig = vi.fn();

vi.mock("../../shared/spawnClaude", () => ({
	spawnClaude: (...args: unknown[]) => mockSpawnClaude(...(args as [])),
}));

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

import { releasesConfigure } from "./releasesConfigure";

function streamsConfig(streams: unknown[]) {
	return { releases: { streams } };
}

const webApp = {
	name: "Web App",
	repo: "owner/name",
	workflow: "release.yml",
	nodes: [
		{ id: "build", kind: "build" },
		{ id: "dev", environment: "dev" },
		{ id: "uk-prod", environment: "UK Production" },
	],
	edges: [
		["build", "dev"],
		["dev", "uk-prod"],
	],
};

let logged: string[] = [];
let errored: string[] = [];

beforeEach(() => {
	vi.clearAllMocks();
	logged = [];
	errored = [];
	process.exitCode = undefined;
	vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
		logged.push(args.join(" "));
	});
	vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
		errored.push(args.join(" "));
	});
	mockLoadConfig.mockReturnValue(streamsConfig([]));
});

describe("releasesConfigure", () => {
	describe("when the repo is not owner/repo", () => {
		it("should fail without launching a session", async () => {
			await releasesConfigure("name");

			expect(mockSpawnClaude).not.toHaveBeenCalled();
			expect(process.exitCode).toBe(1);
			expect(errored.join("\n")).toContain("Expected <owner/repo>");
		});
	});

	describe("the prompt", () => {
		it("should name the repo and let Claude edit", async () => {
			await releasesConfigure("owner/name");

			const [prompt, options] = mockSpawnClaude.mock.calls[0] as unknown as [
				string,
				{ allowEdits: boolean },
			];
			expect(prompt).toContain("owner/name");
			expect(prompt).toContain("releases.streams");
			expect(options.allowEdits).toBe(true);
		});

		it("should tell Claude to follow reusable-workflow uses: chains", async () => {
			await releasesConfigure("owner/name");

			const [prompt] = mockSpawnClaude.mock.calls[0] as unknown as [string];
			expect(prompt).toContain("uses:");
			expect(prompt).toContain("needs:");
		});
	});

	describe("when Claude wrote a valid block", () => {
		it("should report the environments and edges it derived", async () => {
			mockLoadConfig
				.mockReturnValueOnce(streamsConfig([]))
				.mockReturnValue(streamsConfig([webApp]));

			await releasesConfigure("owner/name");

			const output = logged.join("\n");
			expect(output).toContain("environments: dev, UK Production");
			expect(output).toContain("edges: build → dev, dev → uk-prod");
			expect(output).toContain("steps: build [build]");
			expect(process.exitCode).toBeUndefined();
		});

		it("should ignore streams declared for other repos", async () => {
			mockLoadConfig.mockReturnValue(
				streamsConfig([
					webApp,
					{ ...webApp, name: "Other", repo: "owner/other" },
				]),
			);

			await releasesConfigure("owner/name");

			expect(logged.join("\n")).not.toContain("Other");
		});
	});

	describe("when the block does not validate", () => {
		it("should report the schema failure and exit non-zero", async () => {
			mockLoadConfig
				.mockReturnValueOnce(streamsConfig([]))
				.mockImplementation(() => {
					throw new Error("releases.streams.0.workflow: Invalid input");
				});

			await releasesConfigure("owner/name");

			expect(process.exitCode).toBe(1);
			expect(errored.join("\n")).toContain("does not validate");
			expect(errored.join("\n")).toContain("releases.streams.0.workflow");
		});
	});

	describe("when Claude wrote nothing for the repo", () => {
		it("should say so rather than report an empty graph", async () => {
			await releasesConfigure("owner/name");

			expect(logged.join("\n")).toContain(
				"No stream is declared for owner/name",
			);
		});
	});

	describe("when the block was already there and did not change", () => {
		it("should say it is unchanged", async () => {
			mockLoadConfig.mockReturnValue(streamsConfig([webApp]));

			await releasesConfigure("owner/name");

			expect(logged.join("\n")).toContain("is unchanged");
		});
	});
});
