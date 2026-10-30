// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showRunApproval } from "./showRunApproval";

function panel(): ShadowRoot {
	const host = document.querySelector("[data-assist-run-approval]");
	if (!host?.shadowRoot) throw new Error("approval panel not shown");
	return host.shadowRoot;
}

function click(selector: string): void {
	(panel().querySelector(selector) as HTMLButtonElement).click();
}

describe("showRunApproval", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => {
		vi.useRealTimers();
		document.body.innerHTML = "";
	});

	it("shows the full script and resolves run when Run is clicked", async () => {
		const decision = showRunApproval("return document.title;", 60_000);
		expect(panel().querySelector("pre")?.textContent).toBe(
			"return document.title;",
		);
		click("button.run");
		await expect(decision).resolves.toBe("run");
		expect(document.querySelector("[data-assist-run-approval]")).toBeNull();
	});

	it("resolves declined when Dismiss is clicked", async () => {
		const decision = showRunApproval("return 1;", 60_000);
		click("button.dismiss");
		await expect(decision).resolves.toBe("declined");
	});

	it("resolves timeout and removes the panel when nobody decides", async () => {
		const decision = showRunApproval("return 1;", 3_000);
		await vi.advanceTimersByTimeAsync(3_000);
		await expect(decision).resolves.toBe("timeout");
		expect(document.querySelector("[data-assist-run-approval]")).toBeNull();
	});
});
