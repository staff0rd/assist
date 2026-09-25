// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useDiffTreePanel } from "./useDiffTreePanel";

beforeEach(() => {
	localStorage.clear();
});

describe("useDiffTreePanel", () => {
	it("shows the panel by default", () => {
		const { result } = renderHook(() => useDiffTreePanel());

		expect(result.current.treeVisible).toBe(true);
	});

	it("hides the panel when toggled", () => {
		const { result } = renderHook(() => useDiffTreePanel());

		act(() => result.current.onToggleTree());

		expect(result.current.treeVisible).toBe(false);
	});

	it("restores a hidden panel on remount", () => {
		const first = renderHook(() => useDiffTreePanel());
		act(() => first.result.current.onToggleTree());
		first.unmount();

		const { result } = renderHook(() => useDiffTreePanel());

		expect(result.current.treeVisible).toBe(false);
	});

	it("restores a re-shown panel on remount", () => {
		const first = renderHook(() => useDiffTreePanel());
		act(() => first.result.current.onToggleTree());
		act(() => first.result.current.onToggleTree());
		first.unmount();

		const { result } = renderHook(() => useDiffTreePanel());

		expect(result.current.treeVisible).toBe(true);
	});
});
