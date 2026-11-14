// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { restoreScroll } from "./restoreScroll";

function pageWith(count: number) {
	const page = document.createElement("div");
	for (let i = 0; i < count; i++) {
		const el = document.createElement("div");
		el.setAttribute("data-phone-scroll", "");
		page.append(el);
	}
	return page;
}

describe("restoreScroll", () => {
	it("restores each tagged scroller in order", () => {
		const page = pageWith(2);
		restoreScroll(page, [120, 40]);
		const [a, b] = page.querySelectorAll<HTMLElement>("[data-phone-scroll]");
		expect(a.scrollTop).toBe(120);
		expect(b.scrollTop).toBe(40);
	});

	it("keeps retrying until a late-loading scroller appears", async () => {
		const page = pageWith(0);
		restoreScroll(page, [80]);
		const el = document.createElement("div");
		el.setAttribute("data-phone-scroll", "");
		page.append(el);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(el.scrollTop).toBe(80);
	});

	it("stops retrying once the user touches the page", async () => {
		const page = pageWith(0);
		const stop = restoreScroll(page, [80]);
		page.dispatchEvent(new Event("touchstart"));
		const el = document.createElement("div");
		el.setAttribute("data-phone-scroll", "");
		page.append(el);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(el.scrollTop).toBe(0);
		stop();
	});
});
