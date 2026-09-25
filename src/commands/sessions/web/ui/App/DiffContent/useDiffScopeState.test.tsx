// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDiffScopeState } from "./useDiffScopeState";

afterEach(() => {
	vi.unstubAllGlobals();
});

function withScopes(body: unknown) {
	const fetchMock = vi.fn(async () => ({
		ok: true,
		status: 200,
		json: async () => body,
	}));
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

describe("useDiffScopeState", () => {
	it("keeps the branch scope when a branch base resolves", async () => {
		withScopes({ commits: [], branchBase: "origin/main" });

		const { result } = renderHook(() =>
			useDiffScopeState("/repo", "sess-1", "branch"),
		);

		await waitFor(() => expect(result.current.branchBase).toBe("origin/main"));
		expect(result.current.scope).toBe("branch");
	});

	it("falls back to all once the branch base is known to be missing", async () => {
		withScopes({ commits: [], branchBase: null });

		const { result } = renderHook(() =>
			useDiffScopeState("/repo", "sess-1", "branch"),
		);

		await waitFor(() => expect(result.current.scope).toBe("all"));
	});

	it("holds the requested branch scope until the scopes have loaded", () => {
		withScopes({ commits: [], branchBase: null });

		const { result } = renderHook(() =>
			useDiffScopeState("/repo", "sess-1", "branch"),
		);

		expect(result.current.scope).toBe("branch");
	});

	it("passes other scopes through with the item's commits", async () => {
		withScopes({
			commits: [{ sha: "one", title: "feat: one" }],
			branchBase: null,
		});

		const { result } = renderHook(() =>
			useDiffScopeState("/repo", "sess-1", "uncommitted"),
		);

		await waitFor(() => expect(result.current.commits).toHaveLength(1));
		expect(result.current.scope).toBe("uncommitted");
	});
});
