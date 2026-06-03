import { describe, expect, it } from "vitest";
import { originDisplayName } from "./originDisplayName";

describe("originDisplayName", () => {
	it("renders github.com/org/repo origins as org/repo", () => {
		expect(originDisplayName("github.com/org/repo")).toBe("org/repo");
	});

	it("renders scp-style origins (already normalized) as org/repo", () => {
		// scp-like remotes (git@github.com:Org/Repo.git) are canonicalised to
		// github.com/Org/Repo before storage, so the helper sees the host/org/repo form.
		expect(originDisplayName("github.com/Org/Repo")).toBe("Org/Repo");
	});

	it("renders remote-less local origins as the final path segment", () => {
		expect(originDisplayName("local:/path/to/assist")).toBe("assist");
	});

	it("tolerates a trailing slash on local origins", () => {
		expect(originDisplayName("local:/path/to/assist/")).toBe("assist");
	});

	it("handles a local origin that is just the root", () => {
		expect(originDisplayName("local:/")).toBe("local:/");
	});

	it("drops only the host segment, keeping nested repo paths", () => {
		expect(originDisplayName("gitlab.com/group/subgroup/repo")).toBe(
			"group/subgroup/repo",
		);
	});

	it("returns a host-only origin unchanged when there is no path", () => {
		expect(originDisplayName("github.com")).toBe("github.com");
	});
});
