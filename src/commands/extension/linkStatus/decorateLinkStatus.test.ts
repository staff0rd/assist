// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { decorateLinkStatus } from "./decorateLinkStatus";

const ISSUE = "https://github.com/org/repo/issues/1087";

function stubStates(result: unknown) {
	const sendMessage = vi.fn().mockResolvedValue(result);
	vi.stubGlobal("browser", { runtime: { sendMessage } });
	return sendMessage;
}

function render(html: string): HTMLAnchorElement {
	document.body.innerHTML = `<div class="markdown-body">${html}</div>`;
	return document.querySelector("a") as HTMLAnchorElement;
}

async function decorate(): Promise<void> {
	decorateLinkStatus();
	await new Promise((resolve) => setTimeout(resolve));
}

afterEach(() => {
	document.body.innerHTML = "";
	vi.unstubAllGlobals();
});

describe("decorateLinkStatus", () => {
	it("prefixes a labelled icon and colours the link text", async () => {
		const send = stubStates({
			ok: true,
			states: { "org/repo#1087": "issue-completed" },
		});
		const anchor = render(`<a href="${ISSUE}">#1087</a>`);
		await decorate();
		expect(send).toHaveBeenCalledWith({
			type: "assist-link-status",
			refs: [{ owner: "org", repo: "repo", number: 1087 }],
		});
		expect(anchor.querySelector("svg")?.getAttribute("aria-label")).toBe(
			"Closed issue (completed)",
		);
		expect(anchor.style.color).toContain("--fgColor-done");
		expect(anchor.textContent).toBe("#1087");
	});

	it("skips natively decorated links and requests each link once", async () => {
		const send = stubStates({ ok: true, states: {} });
		render(
			`<a class="issue-link js-issue-link" href="${ISSUE}">#1087</a><a href="https://github.com/org/repo">repo</a>`,
		);
		await decorate();
		expect(send).not.toHaveBeenCalled();
		render(`<a href="${ISSUE}">#1087</a>`);
		await decorate();
		await decorate();
		expect(send).toHaveBeenCalledTimes(1);
	});

	it("leaves the link untouched when the lookup fails", async () => {
		stubStates({ ok: false, message: "unreachable" });
		const anchor = render(`<a href="${ISSUE}">#1087</a>`);
		await decorate();
		expect(anchor.querySelector("svg")).toBeNull();
		expect(anchor.getAttribute("style")).toBeNull();
	});
});
