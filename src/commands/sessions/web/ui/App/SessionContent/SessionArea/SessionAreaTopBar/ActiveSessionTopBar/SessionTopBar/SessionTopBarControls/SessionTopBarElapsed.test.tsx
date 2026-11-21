// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { elapsedSizer, SessionTopBarElapsed } from "./SessionTopBarElapsed";
import { makeSessionInfo } from "../../../../../../../../../../../test/mothers/makeSessionInfo";

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

function sizer(): Element | null {
	return document.querySelector("[data-elapsed-sizer]");
}

describe("SessionTopBarElapsed", () => {
	it("keeps the same width-setting sizer as the running timer ticks across digit changes", () => {
		vi.useFakeTimers();
		vi.setSystemTime(9_000);
		render(
			<SessionTopBarElapsed
				session={makeSessionInfo({ runningMs: 0, runningSince: 0 })}
			/>,
		);
		expect(screen.getByText("9s")).toBeTruthy();
		const before = sizer();

		act(() => vi.advanceTimersByTime(1_000));
		expect(screen.getByText("10s")).toBeTruthy();
		act(() => vi.advanceTimersByTime(60_000));
		expect(screen.getByText("1m 10s")).toBeTruthy();

		expect(sizer()).toBe(before);
		const box = sizer()?.parentElement as HTMLElement;
		expect(getComputedStyle(box).fontVariantNumeric).toBe("tabular-nums");
		expect(getComputedStyle(box).display).toBe("inline-grid");
		expect(sizer()?.textContent).toBe(elapsedSizer);
	});
});
