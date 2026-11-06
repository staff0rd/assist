// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LOCAL_NODE, type MergedRepo } from "../../../../mergeRepos";
import { useSelectedRepo } from "./useSelectedRepo";

const merged: MergedRepo[] = [];

afterEach(() => {
	localStorage.clear();
});

describe("useSelectedRepo", () => {
	it("starts on the web server's cwd with nothing stored", () => {
		const { result } = renderHook(() =>
			useSelectedRepo("/repos/home", merged, LOCAL_NODE, "laptop"),
		);

		expect(result.current.selectedCwd).toBe("/repos/home");
	});

	it("restores the selected repo and node after a reload", () => {
		const first = renderHook(() =>
			useSelectedRepo("/repos/home", merged, LOCAL_NODE, "laptop"),
		);
		act(() => first.result.current.setSelectedCwd("/repos/other", "desktop"));
		first.unmount();

		const { result } = renderHook(() =>
			useSelectedRepo("/repos/home", merged, LOCAL_NODE, "laptop"),
		);

		expect(result.current.selectedCwd).toBe("/repos/other");
		expect(result.current.selectedNode).toBe("desktop");
	});

	it("falls back to the cwd when the stored value is corrupt", () => {
		localStorage.setItem("assist.sessions.repo", "{not json");

		const { result } = renderHook(() =>
			useSelectedRepo("/repos/home", merged, LOCAL_NODE, "laptop"),
		);

		expect(result.current.selectedCwd).toBe("/repos/home");
	});
});
