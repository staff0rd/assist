// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postDiffRevert } from "./useDiffRevert/postDiffRevert";
import { postDiffRevertAll } from "./useDiffRevert/postDiffRevertAll";
import { useDiffRevert } from "./useDiffRevert";

vi.mock("./useDiffRevert/postDiffRevert", () => ({ postDiffRevert: vi.fn() }));
vi.mock("./useDiffRevert/postDiffRevertAll", () => ({
	postDiffRevertAll: vi.fn(),
}));

const postDiffRevertMock = vi.mocked(postDiffRevert);
const postDiffRevertAllMock = vi.mocked(postDiffRevertAll);

describe("useDiffRevert", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		postDiffRevertMock.mockResolvedValue();
		postDiffRevertAllMock.mockResolvedValue([]);
	});

	it("offers no revert handler while it is disabled", () => {
		const { result } = renderHook(() => useDiffRevert("/repo", false, vi.fn()));

		expect(result.current.onRevert).toBeUndefined();
		expect(result.current.onRevertPaths).toBeUndefined();
	});

	it("reverts the path and refreshes the diff", async () => {
		const refresh = vi.fn();
		const { result } = renderHook(() => useDiffRevert("/repo", true, refresh));

		act(() => result.current.onRevert?.("src/app.ts"));

		expect(postDiffRevertMock).toHaveBeenCalledWith(
			"/repo",
			"src/app.ts",
			undefined,
		);
		await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
		expect(result.current.error).toBeNull();
	});

	it("surfaces a failure and clears it on demand", async () => {
		const refresh = vi.fn();
		postDiffRevertMock.mockRejectedValue(new Error("pathspec did not match"));
		const { result } = renderHook(() => useDiffRevert("/repo", true, refresh));

		act(() => result.current.onRevert?.("src/app.ts"));

		await waitFor(() =>
			expect(result.current.error).toBe("pathspec did not match"),
		);
		expect(refresh).not.toHaveBeenCalled();

		act(() => result.current.clearError());

		expect(result.current.error).toBeNull();
	});

	it("reverts every path in one request and refreshes once", async () => {
		const refresh = vi.fn();
		const { result } = renderHook(() => useDiffRevert("/repo", true, refresh));

		act(() => result.current.onRevertPaths?.(["src/a.ts", "src/b.ts"]));

		expect(postDiffRevertAllMock).toHaveBeenCalledExactlyOnceWith(
			"/repo",
			["src/a.ts", "src/b.ts"],
			undefined,
		);
		await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
		expect(result.current.error).toBeNull();
	});

	it("refreshes and names the failures when some paths fail", async () => {
		const refresh = vi.fn();
		postDiffRevertAllMock.mockResolvedValue([
			{ path: "src/b.ts", error: "pathspec did not match" },
		]);
		const { result } = renderHook(() => useDiffRevert("/repo", true, refresh));

		act(() => result.current.onRevertPaths?.(["src/a.ts", "src/b.ts"]));

		await waitFor(() =>
			expect(result.current.error).toBe(
				"Failed to revert 1 file: src/b.ts (pathspec did not match)",
			),
		);
		expect(refresh).toHaveBeenCalledOnce();
	});

	it("surfaces a failed bulk request", async () => {
		const refresh = vi.fn();
		postDiffRevertAllMock.mockRejectedValue(new Error("Missing paths"));
		const { result } = renderHook(() => useDiffRevert("/repo", true, refresh));

		act(() => result.current.onRevertPaths?.(["src/a.ts"]));

		await waitFor(() => expect(result.current.error).toBe("Missing paths"));
		expect(refresh).not.toHaveBeenCalled();
	});
});
