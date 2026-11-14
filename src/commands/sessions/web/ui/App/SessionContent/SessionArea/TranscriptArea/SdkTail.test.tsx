// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import { SdkTail } from "./SdkTail";

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe("SdkTail", () => {
	it("shows the restart divider and resuming row while the conversation resumes", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkResuming: true,
					sdkActivity: "Working · Bash ls",
				})}
			/>,
		);
		expect(screen.getByRole("separator").textContent).toContain(
			"Daemon restarted",
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Resuming conversation…",
		);
	});

	it("shows the current activity once resumed", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkActivity: "Working · Bash ls",
				})}
			/>,
		);
		expect(screen.queryByRole("separator")).toBeNull();
		expect(screen.getByRole("status").textContent).toContain(
			"Working · Bash ls",
		);
	});

	it("ticks the tool call's elapsed time after the activity", () => {
		vi.useFakeTimers();
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkActivity: "Working · Bash npm i",
					sdkActivityElapsed: 58,
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Working · Bash npm i · 58s",
		);
		act(() => vi.advanceTimersByTime(3000));
		expect(screen.getByRole("status").textContent).toContain(
			"Working · Bash npm i · 1m 1s",
		);
	});

	it("hides the elapsed time while the turn is stopping", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkInterrupting: true,
					sdkActivityElapsed: 58,
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).not.toContain("58s");
	});

	it("shows live background tasks while waiting", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "waiting",
					sdkBackgroundTasks: ["vite dev"],
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Background · vite dev",
		);
	});
});
