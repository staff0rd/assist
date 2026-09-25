// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
	SessionInfo,
	SessionStatus,
	SidebarTab,
} from "../../../../../types";
import { useJumpToNextWaiting } from "./useJumpToNextWaiting";
import { StarredSessionsProvider } from "../../useStarredSessions";

function Stars({ children }: { children: ReactNode }) {
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			{children}
		</StarredSessionsProvider>
	);
}

function session(id: string, status: SessionStatus): SessionInfo {
	return { id, name: id, commandType: "claude", status, startedAt: 0 };
}

function card(id: string) {
	const element = document.createElement("button");
	element.setAttribute("data-session-id", id);
	element.scrollIntoView = vi.fn();
	document.body.append(element);
	return element;
}

let frames: FrameRequestCallback[] = [];

function pressJumpKey() {
	document.dispatchEvent(
		new KeyboardEvent("keydown", { key: ".", ctrlKey: true, bubbles: true }),
	);
	const pending = frames;
	frames = [];
	for (const frame of pending) frame(0);
}

function renderJump(tab: SidebarTab, sessions: SessionInfo[]) {
	const onSelect = vi.fn();
	const onTabChange = vi.fn();
	renderHook(
		() =>
			useJumpToNextWaiting({
				sessions,
				activeId: null,
				tab,
				onSelect,
				onTabChange,
			}),
		{ wrapper: Stars },
	);
	return { onSelect, onTabChange };
}

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
	document.body.replaceChildren();
});

describe("useJumpToNextWaiting", () => {
	it("flips the sidebar back to active before selecting from the history tab", () => {
		const { onSelect, onTabChange } = renderJump("history", [
			session("a", "running"),
			session("b", "waiting"),
		]);

		pressJumpKey();

		expect(onTabChange).toHaveBeenCalledWith("active");
		expect(onSelect).toHaveBeenCalledWith("b");
	});

	it("leaves the tab alone when the active tab is already showing", () => {
		const { onSelect, onTabChange } = renderJump("active", [
			session("a", "waiting"),
		]);

		pressJumpKey();

		expect(onTabChange).not.toHaveBeenCalled();
		expect(onSelect).toHaveBeenCalledWith("a");
	});

	it("scrolls the jumped-to card into view", () => {
		const target = card("b");
		renderJump("active", [session("a", "running"), session("b", "waiting")]);

		pressJumpKey();

		expect(target.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
	});

	it("changes nothing when no session is waiting", () => {
		const target = card("a");
		const { onSelect, onTabChange } = renderJump("history", [
			session("a", "running"),
		]);

		pressJumpKey();

		expect(onSelect).not.toHaveBeenCalled();
		expect(onTabChange).not.toHaveBeenCalled();
		expect(target.scrollIntoView).not.toHaveBeenCalled();
	});
});
