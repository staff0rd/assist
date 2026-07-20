import { existsSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentOrigin } from "./getCurrentOrigin";
import { resolveRepoLocation } from "./resolveRepoLocation";

vi.mock("node:fs", () => ({ existsSync: vi.fn() }));
vi.mock("./getCurrentOrigin", () => ({ getCurrentOrigin: vi.fn() }));

const mockExists = vi.mocked(existsSync);
const mockOrigin = vi.mocked(getCurrentOrigin);

afterEach(() => vi.clearAllMocks());

describe("resolveRepoLocation", () => {
	it("returns the known cwd without touching disk", () => {
		expect(
			resolveRepoLocation("github.com/org/repo", "/work/repo", "/base"),
		).toEqual({ cwd: "/work/repo" });
		expect(mockExists).not.toHaveBeenCalled();
	});

	it("returns nothing for local: origins with no known cwd", () => {
		expect(
			resolveRepoLocation("local:/home/user/repo", undefined, "/base"),
		).toEqual({});
	});

	it("offers a clone target when nothing exists at the path", () => {
		mockExists.mockReturnValue(false);
		expect(
			resolveRepoLocation("github.com/org/repo", undefined, "/base"),
		).toEqual({ cloneTarget: "/base/repo" });
	});

	it("adopts an existing checkout whose origin matches as the cwd", () => {
		mockExists.mockReturnValue(true);
		mockOrigin.mockReturnValue("github.com/org/repo");
		expect(
			resolveRepoLocation("github.com/org/repo", undefined, "/base"),
		).toEqual({ cwd: "/base/repo" });
	});

	it("offers a clone target when the path holds a different repo", () => {
		mockExists.mockReturnValue(true);
		mockOrigin.mockReturnValue("github.com/org/other");
		expect(
			resolveRepoLocation("github.com/org/repo", undefined, "/base"),
		).toEqual({ cloneTarget: "/base/repo" });
	});
});
