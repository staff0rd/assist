// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import { SdkTail } from "./SdkTail";
import { DequeueMessageContext } from "./useDequeueMessage";
import { ComposerDraftContext } from "../SdkComposer/useComposerDraft";

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe("SdkTail", () => {
	it("removes a queued message by its index and text", () => {
		const dequeue = vi.fn();
		render(
			<DequeueMessageContext.Provider value={dequeue}>
				<SdkTail
					session={makeSessionInfo({
						id: "s1",
						sdk: true,
						status: "running",
						sdkQueued: ["first", "second"],
					})}
				/>
			</DequeueMessageContext.Provider>,
		);
		const buttons = screen.getAllByRole("button", {
			name: "Remove queued message",
		});
		expect(buttons).toHaveLength(2);
		fireEvent.click(buttons[1]);
		expect(dequeue).toHaveBeenCalledWith("s1", 1, "second");
	});

	it.each([
		[true, ["s1", "second"]],
		[false, undefined],
	])(
		"puts an edited message into the composer only when removed (%s)",
		async (removed, appended) => {
			const dequeue = vi.fn().mockResolvedValue(removed);
			const drafts = { register: vi.fn(), append: vi.fn() };
			render(
				<DequeueMessageContext.Provider value={dequeue}>
					<ComposerDraftContext.Provider value={drafts}>
						<SdkTail
							session={makeSessionInfo({
								id: "s1",
								sdk: true,
								status: "running",
								sdkQueued: ["first", "second"],
							})}
						/>
					</ComposerDraftContext.Provider>
				</DequeueMessageContext.Provider>,
			);
			fireEvent.click(
				screen.getAllByRole("button", { name: "Edit queued message" })[1],
			);
			await act(async () => {});
			expect(dequeue).toHaveBeenCalledWith("s1", 1, "second");
			if (appended) expect(drafts.append).toHaveBeenCalledWith(...appended);
			else expect(drafts.append).not.toHaveBeenCalled();
		},
	);

	it("shows the restart divider and resuming row while the conversation resumes", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkResuming: true,
					sdkActivity: "Working · Bash",
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

	it("leaves the restart divider to the transcript once it records the nudge", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					id: "s1",
					sdk: true,
					status: "running",
					sdkResuming: true,
				})}
				transcript={{
					sessionId: "s1",
					messages: [
						{ role: "assistant", text: "earlier reply" },
						{ role: "restart", killed: 1 },
					],
				}}
			/>,
		);
		expect(screen.queryByRole("separator")).toBeNull();
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
					sdkActivity: "Working · Bash",
				})}
			/>,
		);
		expect(screen.queryByRole("separator")).toBeNull();
		expect(screen.getByRole("status").textContent).toContain("Working · Bash");
	});

	it("ticks the tool call's elapsed time after the activity", () => {
		vi.useFakeTimers();
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkActivity: "Working · Bash",
					sdkActivityElapsed: 58,
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Working · Bash · 58s",
		);
		act(() => vi.advanceTimersByTime(3000));
		expect(screen.getByRole("status").textContent).toContain(
			"Working · Bash · 1m 1s",
		);
	});

	it("shows the leaf process command and IO rate after the elapsed time", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkActivity: "Working · Bash",
					sdkActivityElapsed: 58,
					sdkProcess: { command: "curl -O big.iso", ioBytesPerSec: 20480 },
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Working · Bash · 58s · curl -O big.iso · IO 20 KB/s",
		);
	});

	it("flags an idle leaf process in the warning colour", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkActivity: "Working · Bash",
					sdkProcess: {
						command: "sleep 600",
						ioBytesPerSec: 0,
						idleMinutes: 3,
					},
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).toContain(
			"sleep 600 · IO 0 B/s · idle 3m",
		);
		const idle = screen.getByText("idle 3m");
		expect(getComputedStyle(idle).color).not.toBe(
			getComputedStyle(screen.getByRole("status")).color,
		);
	});

	it("names the workflow command and its elapsed time, with its output below", () => {
		vi.useFakeTimers({ now: 200_000 });
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkWorkflow: {
						command: "assist review 2285",
						startedAt: 200_000 - 102_000,
						lines: [
							{ stream: "stdout", text: "[claude] Read a.ts" },
							{ stream: "stderr", text: "[codex] retrying after 429" },
						],
					},
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Working · assist review 2285 · 1m 42s",
		);
		const output = screen.getByLabelText("Workflow output");
		expect(output.textContent).toBe(
			"[claude] Read a.ts\n[codex] retrying after 429",
		);
		const stderr = screen.getByText("[codex] retrying after 429");
		expect(getComputedStyle(stderr).color).not.toBe(
			getComputedStyle(screen.getByText("[claude] Read a.ts")).color,
		);
	});

	it("scrolls the workflow output to the newest line", () => {
		const session = (lines: string[]) =>
			makeSessionInfo({
				sdk: true,
				status: "running",
				sdkWorkflow: {
					command: "assist review 1",
					startedAt: Date.now(),
					lines: lines.map((text) => ({ stream: "stdout" as const, text })),
				},
			});
		const { rerender } = render(<SdkTail session={session(["one"])} />);
		const output = screen.getByLabelText("Workflow output");
		Object.defineProperty(output, "scrollHeight", { value: 500 });
		rerender(<SdkTail session={session(["one", "two"])} />);
		expect(output.scrollTop).toBe(500);
	});

	it("prefers an attached query's activity over the workflow command", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkActivity: "Working · Bash",
					sdkWorkflow: {
						command: "assist backlog run",
						startedAt: Date.now(),
						lines: [{ stream: "stdout", text: "phase 1" }],
					},
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).not.toContain(
			"assist backlog run",
		);
		expect(screen.getByLabelText("Workflow output").textContent).toBe(
			"phase 1",
		);
	});

	it("hides the workflow output once the session stops running", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "done",
					sdkWorkflow: {
						command: "assist review 1",
						startedAt: Date.now(),
						lines: [{ stream: "stdout", text: "x" }],
					},
				})}
			/>,
		);
		expect(screen.queryByLabelText("Workflow output")).toBeNull();
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
					sdkBackgroundTasks: ["Bash"],
				})}
			/>,
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Background · Bash",
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
