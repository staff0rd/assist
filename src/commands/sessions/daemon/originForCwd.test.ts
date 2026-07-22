import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentOrigin } from "../../backlog/getCurrentOrigin";
import { originForCwd } from "./originForCwd";

vi.mock("../../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: vi.fn(),
}));

const mocked = vi.mocked(getCurrentOrigin);

describe("originForCwd", () => {
	beforeEach(() => {
		mocked.mockReset();
	});

	it("returns undefined without resolving when cwd is missing", () => {
		expect(originForCwd(undefined)).toBeUndefined();
		expect(mocked).not.toHaveBeenCalled();
	});

	it("resolves the origin for a cwd", () => {
		mocked.mockReturnValue("host/org/repo");
		expect(originForCwd("/repo/a")).toBe("host/org/repo");
	});

	it("memoises per cwd so git is only shelled once", () => {
		mocked.mockReturnValue("host/org/repo");
		originForCwd("/repo/memo");
		originForCwd("/repo/memo");
		expect(mocked).toHaveBeenCalledTimes(1);
	});
});
