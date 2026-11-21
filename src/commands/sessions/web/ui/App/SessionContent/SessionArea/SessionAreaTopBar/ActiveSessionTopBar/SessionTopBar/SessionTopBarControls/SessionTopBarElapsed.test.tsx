// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { elapsedSizers, SessionTopBarElapsed } from "./SessionTopBarElapsed";
import { makeSessionInfo } from "../../../../../../../../../../../test/mothers/makeSessionInfo";

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

function sizers(): Element[] {
	return [...document.querySelectorAll("[data-elapsed-sizer]")];
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
		const before = sizers();

		act(() => vi.advanceTimersByTime(1_000));
		expect(screen.getByText("10s")).toBeTruthy();
		act(() => vi.advanceTimersByTime(60_000));
		expect(screen.getByText("1m 10s")).toBeTruthy();

		act(() => vi.advanceTimersByTime(3_600_000));
		expect(screen.getByText("1h 1m")).toBeTruthy();

		expect(sizers()).toEqual(before);
		const box = sizers()[0]?.parentElement as HTMLElement;
		expect(getComputedStyle(box).fontVariantNumeric).toBe("tabular-nums");
		expect(getComputedStyle(box).display).toBe("inline-grid");
		expect(sizers().map((s) => s.textContent)).toEqual(elapsedSizers);
	});
});
