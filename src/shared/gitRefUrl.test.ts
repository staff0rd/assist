import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../commands/prs/getPreferredRemoteRepo", () => ({
	getPreferredRemoteRepo: vi.fn(),
}));

import { getPreferredRemoteRepo } from "../commands/prs/getPreferredRemoteRepo";
import { gitRefUrl } from "./gitRefUrl";

const mockRepo = getPreferredRemoteRepo as unknown as ReturnType<typeof vi.fn>;

describe("gitRefUrl", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRepo.mockReturnValue({ org: "acme", repo: "widgets" });
	});

	it("builds a tree url for a branch", () => {
		expect(gitRefUrl("branch", "feature")).toBe(
			"https://github.com/acme/widgets/tree/feature",
		);
	});

	it("builds a commit url for a sha", () => {
		expect(gitRefUrl("commit", "abc123")).toBe(
			"https://github.com/acme/widgets/commit/abc123",
		);
	});

	it("returns undefined when no remote repo is resolvable", () => {
		mockRepo.mockReturnValue(null);
		expect(gitRefUrl("branch", "feature")).toBeUndefined();
	});
});
