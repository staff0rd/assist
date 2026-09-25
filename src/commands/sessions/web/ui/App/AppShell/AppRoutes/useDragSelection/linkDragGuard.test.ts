// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { linkDragGuard } from "./linkDragGuard";

function anchor(): HTMLAnchorElement {
	const link = document.createElement("a");
	link.href = "#target";
	link.textContent = "docs";
	document.body.append(link);
	return link;
}

function click(el: Element): MouseEvent {
	const event = new MouseEvent("click", { bubbles: true, cancelable: true });
	el.dispatchEvent(event);
	return event;
}

afterEach(() => {
	document.body.innerHTML = "";
});

describe("linkDragGuard", () => {
	it("returns null when the press did not land on a link", () => {
		const para = document.createElement("p");
		para.textContent = "plain text";
		document.body.append(para);
		expect(linkDragGuard(para)).toBeNull();
	});

	it("arms for a press on a descendant of a link", () => {
		const link = anchor();
		const code = document.createElement("code");
		link.append(code);
		const guard = linkDragGuard(code);
		expect(guard).not.toBeNull();
		guard?.release(false);
	});

	it("blocks the native link drag while armed", () => {
		const link = anchor();
		const guard = linkDragGuard(link);
		const drag = new Event("dragstart", { bubbles: true, cancelable: true });
		link.dispatchEvent(drag);
		expect(drag.defaultPrevented).toBe(true);
		guard?.release(false);

		const after = new Event("dragstart", { bubbles: true, cancelable: true });
		link.dispatchEvent(after);
		expect(after.defaultPrevented).toBe(false);
	});

	it("lets the click through when released without a drag", () => {
		const link = anchor();
		linkDragGuard(link)?.release(false);
		expect(click(link).defaultPrevented).toBe(false);
	});

	it("swallows only the click that follows a drag", () => {
		const link = anchor();
		linkDragGuard(link)?.release(true);
		expect(click(link).defaultPrevented).toBe(true);
		expect(click(link).defaultPrevented).toBe(false);
	});
});
