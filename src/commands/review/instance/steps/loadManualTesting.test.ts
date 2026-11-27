import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { highLevelSlicesPath } from "../../highLevel/highLevelSlicesPath";
import { loadManualTesting } from "./loadManualTesting";

let store: string;
vi.mock("../../../../shared/loadJson", () => ({ getStoreDir: () => store }));

const head = {
	number: 7,
	fullName: "acme/app",
	headRef: "feature/x",
	sha: "0123456789abcdef",
};

function save(content: unknown) {
	const path = highLevelSlicesPath(head.fullName, head.headRef, head.sha);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify(content));
}

beforeEach(() => {
	store = mkdtempSync(`${tmpdir()}/manual-testing-`);
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(process, "exit").mockImplementation(() => {
		throw new Error("exit");
	});
});

function expectExitWith(message: string) {
	expect(() => loadManualTesting(head)).toThrow("exit");
	expect(process.exit).toHaveBeenCalledWith(1);
	expect(console.error).toHaveBeenCalledWith(expect.stringContaining(message));
}

describe("loadManualTesting", () => {
	it("returns the manualTesting saved for the head SHA", () => {
		const manualTesting = {
			setup: ["Sign in"],
			steps: [{ action: "Open /", expect: "The home page shows" }],
		};
		save({ slices: [], manualTesting });
		expect(loadManualTesting(head)).toEqual(manualTesting);
	});

	it("points at assist review --high-level when nothing is saved", () => {
		expectExitWith(
			"No manual testing steps are saved for #7 at 0123456; run `assist review 7 --high-level` first",
		);
	});

	it("errors when the saved slices predate manualTesting", () => {
		save([]);
		expectExitWith("assist review 7 --high-level");
	});

	it("errors when the saved steps are empty", () => {
		save({ slices: [], manualTesting: { setup: [], steps: [] } });
		expectExitWith("assist review 7 --high-level");
	});
});
