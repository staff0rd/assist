// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { decorateLinkStatus } from "./decorateLinkStatus";

const ISSUE = "https://github.com/org/repo/issues/1087";
const PULL = "https://github.com/org/repo/pull/42/";

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

	it.each([
		["issue", ISSUE, "org/repo#1087", "issue-open", "Open issue"],
		["pull request", PULL, "org/repo#42", "pr-merged", "Merged pull request"],
	])(
		"decorates a native %s reference with no state icon",
		async (_, href, key, state, label) => {
			stubStates({ ok: true, states: { [key]: state } });
			const anchor = render(
				`<a class="issue-link js-issue-link" data-hovercard-type="issue" href="${href}">org/repo#1</a>`,
			);
			await decorate();
			expect(anchor.querySelector("svg")?.getAttribute("aria-label")).toBe(
				label,
			);
		},
	);

	it.each([
		[
			"inside",
			`<a class="issue-link js-issue-link" href="${ISSUE}"><svg class="octicon octicon-issue-closed"></svg>#1087</a>`,
		],
		[
			"before",
			`<svg class="octicon octicon-issue-closed"></svg> <a class="issue-link js-issue-link" href="${ISSUE}">#1087</a>`,
		],
	])("skips a native reference with a state icon %s it", async (_, html) => {
		const send = stubStates({ ok: true, states: {} });
		render(html);
		await decorate();
		expect(send).not.toHaveBeenCalled();
	});

	it("skips non-item links and requests each link once", async () => {
		const send = stubStates({ ok: true, states: {} });
		render(`<a href="https://github.com/org/repo">repo</a>`);
		await decorate();
		expect(send).not.toHaveBeenCalled();
		render(`<a href="${ISSUE}">#1087</a>`);
		await decorate();
		await decorate();
		expect(send).toHaveBeenCalledTimes(1);
	});

	it.each([
		["pr-open", "Open pull request", "--fgColor-open"],
		["pr-draft", "Draft pull request", "--fgColor-muted"],
		["pr-merged", "Merged pull request", "--fgColor-done"],
		["pr-closed", "Closed pull request", "--fgColor-closed"],
	])("decorates a %s pull request link", async (state, label, color) => {
		const send = stubStates({ ok: true, states: { "org/repo#42": state } });
		const anchor = render(`<a href="${PULL}">fix</a>`);
		await decorate();
		expect(send).toHaveBeenCalledWith({
			type: "assist-link-status",
			refs: [{ owner: "org", repo: "repo", number: 42 }],
		});
		expect(anchor.querySelector("svg")?.getAttribute("aria-label")).toBe(label);
		expect(anchor.style.color).toContain(color);
	});

	it.each([
		["the lookup fails", { ok: false, message: "unreachable" }],
		["the ref is unresolved", { ok: true, states: {} }],
		["the state is unknown", { ok: true, states: { "org/repo#1087": "x" } }],
	])("leaves the link untouched when %s", async (_, result) => {
		stubStates(result);
		const anchor = render(`<a href="${ISSUE}">#1087</a>`);
		await decorate();
		expect(anchor.querySelector("svg")).toBeNull();
		expect(anchor.getAttribute("style")).toBeNull();
	});

	it("leaves the link untouched when the background is unreachable", async () => {
		vi.stubGlobal("browser", {
			runtime: { sendMessage: vi.fn().mockRejectedValue(new Error("gone")) },
		});
		const anchor = render(`<a href="${ISSUE}">#1087</a>`);
		await decorate();
		expect(anchor.querySelector("svg")).toBeNull();
		expect(anchor.getAttribute("style")).toBeNull();
	});
});
