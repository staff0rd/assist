import { existsSync } from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../test/mocks/fsMock";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../test/mocks/fsMock")
	).fsMock(),
);

const mockExistsSync = vi.mocked(existsSync);

import { harnesses } from "../../shared/harnesses";
import { reportRetiredAgentsFiles } from "./reportRetiredAgentsFiles";

const claudeMd = path.join(harnesses.claude.homeDir, "CLAUDE.md");
const codexAgents = path.join(harnesses.codex.homeDir, "AGENTS.md");
const piAgents = path.join(harnesses.pi.homeDir, "AGENTS.md");

describe("reportRetiredAgentsFiles", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	it("says nothing when no retired file is left on disk", () => {
		mockExistsSync.mockReturnValue(false);

		reportRetiredAgentsFiles();

		expect(logSpy).not.toHaveBeenCalled();
	});

	it("names every retired file that a previous sync left behind", () => {
		mockExistsSync.mockReturnValue(true);

		reportRetiredAgentsFiles();

		const printed = logSpy.mock.calls.flat().join("\n");
		expect(printed).toContain(claudeMd);
		expect(printed).toContain(codexAgents);
		expect(printed).toContain(piAgents);
	});

	it("names only the files that still exist", () => {
		mockExistsSync.mockImplementation((file) => file === codexAgents);

		reportRetiredAgentsFiles();

		const printed = logSpy.mock.calls.flat().join("\n");
		expect(printed).toContain(codexAgents);
		expect(printed).not.toContain(claudeMd);
		expect(printed).not.toContain(piAgents);
	});
});
