// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { attachCriteriaEditors } from "./attachCriteriaEditors";
import { projectCreateIssueDialogHtml as DIALOG } from "./fixtures/projectCreateIssueDialogHtml";

const DRAFT_EDITOR =
	'<div id="draft"><textarea placeholder="Type your description here…"></textarea></div>';

const TEMPLATE = "## Summary\n\n## Acceptance Criteria\n\n1. first\n";
const PR_PANE = "?pane=issue&issue=acme%7Crepo%7C12";

function dialogField(): HTMLTextAreaElement {
	return document.querySelector(
		'[role="dialog"] textarea',
	) as HTMLTextAreaElement;
}

function outlineShown(): boolean {
	return dialogField().style.display === "none";
}

function toggles(root: ParentNode = document): number {
	return root.querySelectorAll("[data-assist-criteria-toggle]").length;
}

beforeEach(() => {
	globalThis.history.pushState({}, "", "/orgs/acme/projects/6/views/1");
});

afterEach(() => {
	document.body.innerHTML = "";
});

describe("attachCriteriaEditors", () => {
	it("adds the toggle to the project create-issue dialog's body field", () => {
		document.body.innerHTML = DIALOG;
		attachCriteriaEditors();
		const dialog = document.querySelector('[role="dialog"]') as Element;
		expect(toggles(dialog)).toBe(1);
		expect(
			dialog
				.querySelector("textarea")
				?.hasAttribute("data-assist-criteria-attached"),
		).toBe(true);
	});

	it("leaves editors outside the dialog alone", () => {
		document.body.innerHTML = `${DRAFT_EDITOR}${DIALOG}`;
		attachCriteriaEditors();
		expect(toggles(document.getElementById("draft") as Element)).toBe(0);
	});

	it("adds nothing on a project view with no dialog and no issue pane", () => {
		document.body.innerHTML = DRAFT_EDITOR;
		attachCriteriaEditors();
		expect(toggles()).toBe(0);
	});

	it("attaches once to a reopened dialog", () => {
		document.body.innerHTML = DIALOG;
		attachCriteriaEditors();
		document.body.innerHTML = DIALOG;
		attachCriteriaEditors();
		attachCriteriaEditors();
		expect(toggles()).toBe(1);
	});

	it("attaches once to the textarea GitHub remounts on reopen", async () => {
		document.body.innerHTML = DIALOG;
		attachCriteriaEditors();
		document.querySelector('[role="dialog"]')?.remove();
		attachCriteriaEditors();
		expect(toggles()).toBe(0);
		document.body.insertAdjacentHTML("beforeend", DIALOG);
		await act(async () => attachCriteriaEditors());
		await act(async () => attachCriteriaEditors());
		expect(toggles()).toBe(1);
		expect(dialogField().hasAttribute("data-assist-criteria-attached")).toBe(
			true,
		);
	});

	it("opens the outline when the chosen template has criteria", async () => {
		document.body.innerHTML = DIALOG;
		dialogField().value = TEMPLATE;
		await act(async () => attachCriteriaEditors());
		expect(outlineShown()).toBe(true);
	});

	it("opens the outline when the template body arrives after mount", async () => {
		document.body.innerHTML = DIALOG;
		attachCriteriaEditors();
		expect(outlineShown()).toBe(false);
		dialogField().value = TEMPLATE;
		await act(async () => attachCriteriaEditors());
		expect(outlineShown()).toBe(true);
		expect(toggles()).toBe(1);
	});

	it("adds nothing to a pull request pane on the board", () => {
		globalThis.history.pushState(
			{},
			"",
			`/orgs/acme/projects/6/views/1${PR_PANE}`,
		);
		document.body.innerHTML = `<a href="/acme/repo/pull/12">#12</a>${DRAFT_EDITOR}`;
		attachCriteriaEditors();
		expect(toggles()).toBe(0);
	});

	it("adds nothing to a draft issue editor beside a pull request pane", () => {
		globalThis.history.pushState({}, "", `/users/acme/projects/2${PR_PANE}`);
		document.body.innerHTML = `<a href="/acme/repo/pull/12">#12</a>${DRAFT_EDITOR}`;
		attachCriteriaEditors();
		expect(toggles()).toBe(0);
	});
});
