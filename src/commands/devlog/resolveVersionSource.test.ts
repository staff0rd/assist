import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);
vi.mock("./getVersionAtCommit", () => ({ getVersionAtCommit: vi.fn() }));

import { getVersionAtCommit } from "./getVersionAtCommit";
import { resolveVersionSource } from "./resolveVersionSource";

const mockExecFileSync = vi.mocked(execFileSync);
const mockGetVersionAtCommit = vi.mocked(getVersionAtCommit);

function givenTags(all: string[], mergedIntoHead: string[]): void {
	mockExecFileSync.mockImplementation((_cmd, args) => {
		const tags = (args as string[]).includes("--merged") ? mergedIntoHead : all;
		return `${tags.join("\n")}\n`;
	});
}

describe("resolveVersionSource current", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("reports the latest semver tag reachable from HEAD when package.json is stale", () => {
		mockGetVersionAtCommit.mockReturnValue("0.1.0");
		givenTags(
			["v0.1.0", "v0.2.0", "v0.10.0", "v0.11.0"],
			["v0.1.0", "v0.2.0", "v0.10.0", "review-v0.99.0"],
		);

		const source = resolveVersionSource();

		expect(source.kind).toBe("tags");
		expect(source.current()).toBe("v0.10.0");
	});

	it("stays in package mode when the only newer tags are not reachable from HEAD", () => {
		mockGetVersionAtCommit.mockReturnValue("0.1069.0");
		givenTags(["v0.1069.0", "v0.1069.2"], ["v0.1069.0"]);

		const source = resolveVersionSource();

		expect(source.kind).toBe("package");
		expect(source.current()).toBe("v0.1069");
	});

	it("reports package.json cut to major.minor when it matches the latest tag", () => {
		mockGetVersionAtCommit.mockReturnValue("0.1069.1");
		givenTags(["v0.1069.0", "v0.1069.1"], ["v0.1069.0", "v0.1069.1"]);

		const source = resolveVersionSource();

		expect(source.kind).toBe("package");
		expect(source.current()).toBe("v0.1069");
	});

	it("reports no version in package mode without a package.json version", () => {
		mockGetVersionAtCommit.mockReturnValue(null);
		givenTags([], []);

		expect(resolveVersionSource().current()).toBeNull();
	});
});
