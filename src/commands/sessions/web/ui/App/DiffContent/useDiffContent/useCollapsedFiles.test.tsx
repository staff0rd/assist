// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCollapsedFiles } from "./useCollapsedFiles";

beforeEach(() => {
	sessionStorage.clear();
});

describe("useCollapsedFiles", () => {
	it("reports unknown paths as expanded", () => {
		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		expect(result.current.isCollapsed("src/app.ts")).toBe(false);
	});

	it("collapses a path when toggled", () => {
		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		act(() => result.current.toggle("src/app.ts"));

		expect(result.current.isCollapsed("src/app.ts")).toBe(true);
	});

	it("expands a collapsed path when toggled again", () => {
		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		act(() => result.current.toggle("src/app.ts"));
		act(() => result.current.toggle("src/app.ts"));

		expect(result.current.isCollapsed("src/app.ts")).toBe(false);
	});

	it("hydrates collapsed paths from session storage on remount", () => {
		const first = renderHook(() => useCollapsedFiles("/repo"));
		act(() => first.result.current.toggle("src/app.ts"));
		first.unmount();

		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		expect(result.current.isCollapsed("src/app.ts")).toBe(true);
	});

	it("persists an expanded path so it does not come back collapsed", () => {
		const first = renderHook(() => useCollapsedFiles("/repo"));
		act(() => first.result.current.toggle("src/app.ts"));
		act(() => first.result.current.toggle("src/app.ts"));
		first.unmount();

		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		expect(result.current.isCollapsed("src/app.ts")).toBe(false);
	});

	it("keeps collapsed paths independent per worktree", () => {
		const first = renderHook(() => useCollapsedFiles("/repo"));
		act(() => first.result.current.toggle("src/app.ts"));
		first.unmount();

		const { result } = renderHook(() => useCollapsedFiles("/other"));

		expect(result.current.isCollapsed("src/app.ts")).toBe(false);
	});

	it("rehydrates when the worktree changes", () => {
		const seed = renderHook(() => useCollapsedFiles("/other"));
		act(() => seed.result.current.toggle("src/app.ts"));
		seed.unmount();

		const { result, rerender } = renderHook(
			({ cwd }) => useCollapsedFiles(cwd),
			{ initialProps: { cwd: "/repo" } },
		);
		expect(result.current.isCollapsed("src/app.ts")).toBe(false);

		rerender({ cwd: "/other" });

		expect(result.current.isCollapsed("src/app.ts")).toBe(true);
	});

	it("collapses every given path at once", () => {
		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		act(() => result.current.setAll(["src/app.ts", "src/cli.ts"], true));

		expect(result.current.isCollapsed("src/app.ts")).toBe(true);
		expect(result.current.isCollapsed("src/cli.ts")).toBe(true);
	});

	it("expands every given path at once", () => {
		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		act(() => result.current.setAll(["src/app.ts", "src/cli.ts"], true));
		act(() => result.current.setAll(["src/app.ts", "src/cli.ts"], false));

		expect(result.current.isCollapsed("src/app.ts")).toBe(false);
		expect(result.current.isCollapsed("src/cli.ts")).toBe(false);
	});

	it("leaves paths outside the given set alone", () => {
		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		act(() => result.current.toggle("src/hidden.ts"));
		act(() => result.current.setAll(["src/app.ts"], true));

		expect(result.current.isCollapsed("src/hidden.ts")).toBe(true);

		act(() => result.current.setAll(["src/app.ts"], false));

		expect(result.current.isCollapsed("src/hidden.ts")).toBe(true);
	});

	it("persists a bulk collapse across remounts", () => {
		const first = renderHook(() => useCollapsedFiles("/repo"));
		act(() => first.result.current.setAll(["src/app.ts"], true));
		first.unmount();

		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		expect(result.current.isCollapsed("src/app.ts")).toBe(true);
	});

	it("ignores malformed stored state", () => {
		sessionStorage.setItem("assist:diff-collapsed:/repo", "not json");

		const { result } = renderHook(() => useCollapsedFiles("/repo"));

		expect(result.current.isCollapsed("src/app.ts")).toBe(false);
	});
});
