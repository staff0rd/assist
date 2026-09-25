// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSidebarCollapsed } from "./useSidebarCollapsed";

beforeEach(() => {
	localStorage.clear();
});

describe("useSidebarCollapsed", () => {
	it("expands the sidebar by default", () => {
		const { result } = renderHook(() => useSidebarCollapsed());

		expect(result.current.collapsed).toBe(false);
	});

	it("collapses the sidebar when toggled", () => {
		const { result } = renderHook(() => useSidebarCollapsed());

		act(() => result.current.onToggleCollapsed());

		expect(result.current.collapsed).toBe(true);
	});

	it("expands the sidebar when toggled twice", () => {
		const { result } = renderHook(() => useSidebarCollapsed());

		act(() => result.current.onToggleCollapsed());
		act(() => result.current.onToggleCollapsed());

		expect(result.current.collapsed).toBe(false);
	});

	it("restores a collapsed sidebar on remount", () => {
		const first = renderHook(() => useSidebarCollapsed());
		act(() => first.result.current.onToggleCollapsed());
		first.unmount();

		const { result } = renderHook(() => useSidebarCollapsed());

		expect(result.current.collapsed).toBe(true);
	});

	it("restores a re-expanded sidebar on remount", () => {
		const first = renderHook(() => useSidebarCollapsed());
		act(() => first.result.current.onToggleCollapsed());
		act(() => first.result.current.onToggleCollapsed());
		first.unmount();

		const { result } = renderHook(() => useSidebarCollapsed());

		expect(result.current.collapsed).toBe(false);
	});

	it("persists under the assist:sidebar-collapsed key", () => {
		const { result } = renderHook(() => useSidebarCollapsed());

		act(() => result.current.onToggleCollapsed());

		expect(localStorage.getItem("assist:sidebar-collapsed")).toContain("true");
	});
});
