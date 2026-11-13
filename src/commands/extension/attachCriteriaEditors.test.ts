// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { attachCriteriaEditors } from "./attachCriteriaEditors";
import { projectCreateIssueDialogHtml as DIALOG } from "./fixtures/projectCreateIssueDialogHtml";

const DRAFT_EDITOR =
	'<div id="draft"><textarea placeholder="Type your description here…"></textarea></div>';

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
});
