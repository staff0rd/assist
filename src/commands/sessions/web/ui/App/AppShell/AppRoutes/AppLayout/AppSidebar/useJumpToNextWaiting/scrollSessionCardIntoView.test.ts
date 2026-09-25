// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scrollSessionCardIntoView } from "./scrollSessionCardIntoView";

function card(id: string) {
	const element = document.createElement("button");
	element.setAttribute("data-session-id", id);
	element.scrollIntoView = vi.fn();
	document.body.append(element);
	return element;
}

let frames: FrameRequestCallback[] = [];

function runFrames() {
	const pending = frames;
	frames = [];
	for (const frame of pending) frame(0);
}

beforeEach(() => {
	frames = [];
	vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
		frames.push(frame);
		return frames.length;
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
	document.body.replaceChildren();
});

describe("scrollSessionCardIntoView", () => {
	it("scrolls the matching card into view without moving the page", () => {
		const target = card("b");
		card("a");

		scrollSessionCardIntoView("b");
		runFrames();

		expect(target.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
	});

	it("waits for the next frame so a just-rendered card can be found", () => {
		scrollSessionCardIntoView("late");
		const target = card("late");
		runFrames();

		expect(target.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
	});

	it("leaves other cards alone", () => {
		const other = card("a");
		card("b");

		scrollSessionCardIntoView("b");
		runFrames();

		expect(other.scrollIntoView).not.toHaveBeenCalled();
	});

	it("does nothing when no card matches", () => {
		const other = card("a");

		scrollSessionCardIntoView("missing");
		runFrames();

		expect(other.scrollIntoView).not.toHaveBeenCalled();
	});
});
