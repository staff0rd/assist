import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LinkRef, LinkState } from "./LinkState";
import { clearLinkStateCache, resolveLinkStates } from "./resolveLinkStates";

function ref(number: number, repo = "repo"): LinkRef {
	return { owner: "Org", repo, number };
}

function openQuery() {
	return vi.fn(async (refs: LinkRef[]) =>
		refs.map((): LinkState | null => "issue-open"),
	);
}

beforeEach(() => clearLinkStateCache());

describe("resolveLinkStates", () => {
	it("deduplicates refs and keys states case-insensitively", async () => {
		const query = openQuery();
		const states = await resolveLinkStates(
			[ref(1), { owner: "org", repo: "REPO", number: 1 }, ref(2)],
			query,
		);
		expect(query).toHaveBeenCalledTimes(1);
		expect(query.mock.calls[0][0]).toHaveLength(2);
		expect(states).toEqual({
			"org/repo#1": "issue-open",
			"org/repo#2": "issue-open",
		});
	});

	it("chunks at most 100 refs per query", async () => {
		const query = openQuery();
		await resolveLinkStates(
			Array.from({ length: 250 }, (_, i) => ref(i + 1)),
			query,
		);
		expect(query.mock.calls.map(([refs]) => refs.length)).toEqual([
			100, 100, 50,
		]);
	});

	it("serves repeat lookups from the cache", async () => {
		const query = openQuery();
		await resolveLinkStates([ref(1)], query);
		const states = await resolveLinkStates([ref(1)], query);
		expect(query).toHaveBeenCalledTimes(1);
		expect(states).toEqual({ "org/repo#1": "issue-open" });
	});

	it("coalesces identical in-flight lookups", async () => {
		const query = openQuery();
		await Promise.all([
			resolveLinkStates([ref(1)], query),
			resolveLinkStates([ref(1)], query),
		]);
		expect(query).toHaveBeenCalledTimes(1);
	});

	it("omits unresolved refs and does not cache a failed query", async () => {
		const failing = vi.fn().mockRejectedValue(new Error("gh failed"));
		expect(await resolveLinkStates([ref(1)], failing)).toEqual({});
		const unresolved = vi.fn(async () => [null]);
		expect(await resolveLinkStates([ref(1)], unresolved)).toEqual({});
		expect(unresolved).toHaveBeenCalledTimes(1);
	});
});
