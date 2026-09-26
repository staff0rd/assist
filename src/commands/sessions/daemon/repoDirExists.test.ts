import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { repoDirExists } from "./repoDirExists";

vi.mock("node:fs", () => ({ existsSync: vi.fn() }));

const exists = vi.mocked(existsSync);

describe("repoDirExists", () => {
	beforeEach(() => {
		exists.mockReset();
	});

	it("reports a directory that exists", () => {
		exists.mockReturnValue(true);

		expect(repoDirExists("/git/repo")).toBe(true);
		expect(exists).toHaveBeenCalledWith("/git/repo");
	});

	it("reports a directory that no longer exists", () => {
		exists.mockReturnValue(false);

		expect(repoDirExists("/git/repo-2")).toBe(false);
	});
});
