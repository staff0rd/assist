// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePhoneRepoFilter } from "./usePhoneRepoFilter";

afterEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

describe("usePhoneRepoFilter", () => {
	it("defaults to All", () => {
		const { result } = renderHook(() => usePhoneRepoFilter());

		expect(result.current[0]).toBeNull();
	});

	it("persists the choice and shares it with every user of the hook", () => {
		const first = renderHook(() => usePhoneRepoFilter());
		const second = renderHook(() => usePhoneRepoFilter());

		act(() => first.result.current[1]("/git/assist"));

		expect(second.result.current[0]).toBe("/git/assist");
		expect(localStorage.getItem("assist.phone.repoFilter")).toBe("/git/assist");
		first.unmount();
		second.unmount();
		expect(renderHook(() => usePhoneRepoFilter()).result.current[0]).toBe(
			"/git/assist",
		);

		act(() => first.result.current[1](null));
		expect(localStorage.getItem("assist.phone.repoFilter")).toBeNull();
	});

	it("still filters when storage throws", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("blocked");
		});
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("blocked");
		});
		const { result } = renderHook(() => usePhoneRepoFilter());

		act(() => result.current[1]("/git/assist"));

		expect(result.current[0]).toBe("/git/assist");
	});
});
