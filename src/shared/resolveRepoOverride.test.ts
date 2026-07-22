import { describe, expect, it } from "vitest";
import {
	AmbiguousRepoConfigError,
	originKeyCandidates,
	resolveRepoOverride,
} from "./resolveRepoOverride";

describe("originKeyCandidates", () => {
	it("offers the full origin, org/repo, and bare repo forms", () => {
		expect(originKeyCandidates("github.com/org/repo")).toEqual(
			new Set(["github.com/org/repo", "org/repo", "repo"]),
		);
	});

	it("keeps nested repo paths in the host-less form", () => {
		expect(originKeyCandidates("gitlab.com/group/subgroup/repo")).toEqual(
			new Set([
				"gitlab.com/group/subgroup/repo",
				"group/subgroup/repo",
				"repo",
			]),
		);
	});

	it("uses the final path segment for remote-less local origins", () => {
		expect(originKeyCandidates("local:/path/to/assist")).toEqual(
			new Set(["local:/path/to/assist", "assist"]),
		);
	});
});

describe("resolveRepoOverride", () => {
	const origin = "github.com/org/assist";

	it("returns an empty object when there is no repos block", () => {
		expect(resolveRepoOverride({}, origin)).toEqual({});
	});

	it("matches a bare repo name", () => {
		const globalRaw = {
			repos: { assist: { commit: { push: true } } },
		};
		expect(resolveRepoOverride(globalRaw, origin)).toEqual({
			commit: { push: true },
		});
	});

	it("matches the org/repo form", () => {
		const globalRaw = {
			repos: { "org/assist": { commit: { push: true } } },
		};
		expect(resolveRepoOverride(globalRaw, origin)).toEqual({
			commit: { push: true },
		});
	});

	it("matches the full host/org/repo origin", () => {
		const globalRaw = {
			repos: { "github.com/org/assist": { commit: { push: true } } },
		};
		expect(resolveRepoOverride(globalRaw, origin)).toEqual({
			commit: { push: true },
		});
	});

	it("returns empty when no key matches the current repo", () => {
		const globalRaw = {
			repos: { "org/other": { commit: { push: true } } },
		};
		expect(resolveRepoOverride(globalRaw, origin)).toEqual({});
	});

	it("does not falsely match a different repo sharing a bare name", () => {
		const globalRaw = {
			repos: { "org2/assist": { commit: { push: true } } },
		};
		expect(resolveRepoOverride(globalRaw, origin)).toEqual({});
	});

	it("throws when multiple keys match the same repository", () => {
		const globalRaw = {
			repos: {
				assist: { commit: { push: true } },
				"org/assist": { commit: { push: false } },
			},
		};
		expect(() => resolveRepoOverride(globalRaw, origin)).toThrow(
			AmbiguousRepoConfigError,
		);
	});
});
