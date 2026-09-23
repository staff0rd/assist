import { beforeEach, describe, expect, it, vi } from "vitest";

const mockWriteConfigKeys = vi.fn();
const mockLoadConfig = vi.fn();
const mockDeclaredStreamsInScope = vi.fn();
const mockGetRepoInfo = vi.fn(() => ({ org: "owner", repo: "name" }));
let input = "";

vi.mock("node:fs", () => ({ readFileSync: () => input }));

vi.mock("../config/writeConfigKeys", () => ({
	writeConfigKeys: (...args: unknown[]) => mockWriteConfigKeys(...(args as [])),
}));

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

vi.mock("./declaredStreamsInScope", () => ({
	declaredStreamsInScope: (...args: unknown[]) =>
		mockDeclaredStreamsInScope(...(args as [])),
}));

vi.mock("../prs/shared", () => ({ getRepoInfo: () => mockGetRepoInfo() }));

import { releasesConfigure } from "./releasesConfigure";

const webApp = {
	name: "Web App",
	workflow: "release.yml",
	nodes: [
		{ id: "build", kind: "build" },
		{ id: "dev", environment: "dev" },
		{ id: "eu-prod", environment: "EU Production" },
	],
	edges: [
		["build", "dev"],
		["dev", "eu-prod"],
	],
};

let logged: string[] = [];
let errored: string[] = [];

function writtenStreams(): Record<string, unknown>[] {
	const [writes] = mockWriteConfigKeys.mock.calls[0] as [
		{ key: string; value: Record<string, unknown>[] }[],
	];
	return writes[0].value;
}

beforeEach(() => {
	vi.clearAllMocks();
	logged = [];
	errored = [];
	process.exitCode = undefined;
	input = JSON.stringify([webApp]);
	vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
		logged.push(args.join(" "));
	});
	vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
		errored.push(args.join(" "));
	});
	mockDeclaredStreamsInScope.mockReturnValue([]);
	mockWriteConfigKeys.mockReturnValue({
		ok: true,
		target: "project assist.yml",
	});
	mockLoadConfig.mockReturnValue({
		releases: { streams: [{ ...webApp, repo: "owner/name" }] },
	});
});

describe("releasesConfigure", () => {
	describe("the repo a stream belongs to", () => {
		it("should be inferred from the current directory, not passed in", () => {
			releasesConfigure({ streams: "streams.json" });

			expect(mockGetRepoInfo).toHaveBeenCalled();
			expect(writtenStreams()[0].repo).toBe("owner/name");
		});

		it("should be left alone when the stream names one itself", () => {
			input = JSON.stringify([{ ...webApp, repo: "other/name" }]);

			releasesConfigure({ streams: "streams.json" });

			expect(mockGetRepoInfo).not.toHaveBeenCalled();
			expect(writtenStreams()[0].repo).toBe("other/name");
		});
	});

	describe("when streams are already declared", () => {
		it("should replace this repo's and keep the others", () => {
			mockDeclaredStreamsInScope.mockReturnValue([
				{ name: "Stale", repo: "OWNER/NAME" },
				{ name: "Elsewhere", repo: "other/repo" },
			]);

			releasesConfigure({ streams: "streams.json" });

			expect(writtenStreams().map((s) => s.name)).toEqual([
				"Elsewhere",
				"Web App",
			]);
		});
	});

	describe("when an edge refers to a node that does not exist", () => {
		it("should write nothing and name the edge", () => {
			input = JSON.stringify([{ ...webApp, edges: [["build", "staging"]] }]);

			releasesConfigure({ streams: "streams.json" });

			expect(mockWriteConfigKeys).not.toHaveBeenCalled();
			expect(process.exitCode).toBe(1);
			expect(errored.join("\n")).toContain('unknown node "staging"');
		});
	});

	describe("when two nodes share an id", () => {
		it("should write nothing and name the id", () => {
			input = JSON.stringify([
				{ ...webApp, nodes: [{ id: "dev" }, { id: "dev" }], edges: [] },
			]);

			releasesConfigure({ streams: "streams.json" });

			expect(mockWriteConfigKeys).not.toHaveBeenCalled();
			expect(errored.join("\n")).toContain('duplicate node id "dev"');
		});
	});

	describe("when the input is not an array of streams", () => {
		it("should report it rather than writing", () => {
			input = JSON.stringify({ name: "Web App" });

			releasesConfigure({ streams: "streams.json" });

			expect(mockWriteConfigKeys).not.toHaveBeenCalled();
			expect(errored.join("\n")).toContain("Expected an array of streams");
		});
	});

	describe("when the block fails the config schema", () => {
		it("should print each error and exit non-zero", () => {
			mockWriteConfigKeys.mockReturnValue({
				ok: false,
				errors: ["releases.streams.0.workflow: Invalid input"],
			});

			releasesConfigure({ streams: "streams.json" });

			expect(process.exitCode).toBe(1);
			expect(errored.join("\n")).toContain("nothing was written");
			expect(errored.join("\n")).toContain("releases.streams.0.workflow");
		});
	});

	describe("when the write succeeds", () => {
		it("should report the environments, steps and edges it derived", () => {
			releasesConfigure({ streams: "streams.json" });

			const output = logged.join("\n");
			expect(output).toContain("environments: dev, EU Production");
			expect(output).toContain("steps: build [build]");
			expect(output).toContain("edges: build → dev, dev → eu-prod");
			expect(output).toContain("Written to project assist.yml");
		});
	});

	describe("--scope repo", () => {
		it("should read and write the repo block", () => {
			releasesConfigure({ streams: "streams.json", scope: "repo" });

			expect(mockDeclaredStreamsInScope).toHaveBeenCalledWith("repo");
			expect(mockWriteConfigKeys).toHaveBeenCalledWith(
				expect.anything(),
				"repo",
			);
		});
	});
});
