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

	it("shows the leaf process command and IO rate after the elapsed time", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkActivity: "Working · Bash npm i",
					sdkActivityElapsed: 58,
					sdkProcess: { command: "curl -O big.iso", ioBytesPerSec: 20480 },
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Working · Bash npm i · 58s · curl -O big.iso · IO 20 KB/s",
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

	it("shows pending messages as user rows until the transcript's latest user rows contain them", () => {
		const session = makeSessionInfo({
			id: "s1",
			sdk: true,
			status: "running",
			sdkPending: ["hello there", "and more"],
		});
		const { rerender } = render(
			<SdkTail
				session={session}
				transcript={{
					sessionId: "s1",
					messages: [
						{ role: "user", text: "earlier ask" },
						{ role: "assistant", text: "earlier reply" },
					],
				}}
			/>,
		);
		expect(screen.getByText("hello there")).toBeTruthy();
		expect(screen.getByText("and more")).toBeTruthy();
		rerender(
			<SdkTail
				session={session}
				transcript={{
					sessionId: "s1",
					messages: [
						{ role: "assistant", text: "earlier reply" },
						{ role: "user", text: "hello there" },
					],
				}}
			/>,
		);
		expect(screen.queryByText("hello there")).toBeNull();
		expect(screen.getByText("and more")).toBeTruthy();
	});

	it("shows a flushed queue as one user row until the transcript records it", () => {
		const session = makeSessionInfo({
			id: "s1",
			sdk: true,
			status: "running",
			sdkPending: ["second\n\nthird "],
		});
		const transcript = (messages: { role: "user"; text: string }[]) => ({
			sessionId: "s1",
			messages: [{ role: "assistant" as const, text: "reply" }, ...messages],
		});
		const { container, rerender } = render(
			<SdkTail session={session} transcript={transcript([])} />,
		);
		expect(container.textContent).toContain("second");
		expect(container.textContent).toContain("third");
		rerender(
			<SdkTail
				session={session}
				transcript={transcript([{ role: "user", text: "second\n\nthird" }])}
			/>,
		);
		expect(container.textContent).not.toContain("second");
	});
});
