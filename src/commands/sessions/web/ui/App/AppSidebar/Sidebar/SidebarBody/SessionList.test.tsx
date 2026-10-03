// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isSessionCardFocusHeld } from "../../../holdSessionCardFocus";
import { SessionList } from "./SessionList";
import type { SessionInfo } from "../../../../types";
import { StarredSessionsProvider } from "../../../useStarredSessions";

let frames: FrameRequestCallback[] = [];

beforeEach(() => {
	frames = [];
	vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
		frames.push(frame);
		return frames.length;
	});
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function session(id: string): SessionInfo {
	return {
		id,
		name: id,
		commandType: "claude",
		status: "running",
		startedAt: 0,
	};
}

function List({
	sessions,
	onSelect,
}: {
	sessions: SessionInfo[];
	onSelect: (id: string) => void;
}) {
	const [activeId, setActiveId] = useState<string | null>(
		sessions[0]?.id ?? null,
	);
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			<SessionList
				sessions={sessions}
				pendingLaunches={[]}
				activeId={activeId}
				initialized={new Set(sessions.map((s) => s.id))}
				onSelect={(id) => {
					setActiveId(id);
					onSelect(id);
				}}
				onDismissPending={() => {}}
				onRetry={() => {}}
				onRestart={() => {}}
				onDismiss={() => {}}
				onSetAutoRun={() => {}}
				onSetAutoAdvance={() => {}}
			/>
		</StarredSessionsProvider>
	);
}

function card(id: string) {
	return document.querySelector<HTMLElement>(`[data-session-id="${id}"]`)!;
}

function renderCycling() {
	const onSelect = vi.fn();
	render(
		<List
			sessions={[session("a"), session("b"), session("c")]}
			onSelect={onSelect}
		/>,
	);
	for (const id of ["a", "b", "c"]) card(id).scrollIntoView = vi.fn();
	card("a").focus();
	return onSelect;
}

function pressTab(shiftKey = false) {
	const notCancelled = fireEvent.keyDown(document.activeElement!, {
		key: "Tab",
		shiftKey,
	});
	for (const frame of frames.splice(0)) frame(0);
	return notCancelled;
}

describe("SessionList scroll area", () => {
	it("scrolls without vertical padding so sticky group headers stop at its top edge", () => {
		const { container } = render(<List sessions={[]} onSelect={() => {}} />);
		const scrollport = container.firstElementChild as HTMLElement;

		expect(getComputedStyle(scrollport).overflow).toBe("auto");
		expect(getComputedStyle(scrollport).paddingTop).toBe("0");
	});
});

describe("SessionList Tab cycling", () => {
	it("selects, focuses and scrolls to the next card on Tab", () => {
		const onSelect = renderCycling();

		expect(pressTab()).toBe(false);

		expect(onSelect).toHaveBeenLastCalledWith("b");
		expect(document.activeElement).toBe(card("b"));
		expect(card("b").scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
	});

	it("selects the previous card on Shift+Tab, wrapping to the last", () => {
		const onSelect = renderCycling();

		pressTab(true);

		expect(onSelect).toHaveBeenLastCalledWith("c");
		expect(document.activeElement).toBe(card("c"));
	});

	it("keeps cycling on repeated Tab and wraps back to the first card", () => {
		const onSelect = renderCycling();

		pressTab();
		pressTab();
		pressTab();

		expect(onSelect.mock.calls.map(([id]) => id)).toEqual(["b", "c", "a"]);
		expect(document.activeElement).toBe(card("a"));
		expect(isSessionCardFocusHeld()).toBe(true);
	});

	it("switches card when Tab comes from a button inside a card", () => {
		const onSelect = renderCycling();
		const inner = document.createElement("button");
		card("b").append(inner);
		inner.focus();

		pressTab();

		expect(onSelect).toHaveBeenLastCalledWith("c");
		expect(document.activeElement).toBe(card("c"));
	});

	it("releases the focus hold once focus leaves the card", () => {
		renderCycling();
		pressTab();

		card("b").blur();

		expect(isSessionCardFocusHeld()).toBe(false);
	});

	it("leaves Tab with other modifiers alone", () => {
		const onSelect = renderCycling();

		fireEvent.keyDown(card("a"), { key: "Tab", ctrlKey: true });

		expect(onSelect).not.toHaveBeenCalled();
	});
});
