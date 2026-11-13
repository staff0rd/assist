// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { criteriaEditorScope } from "./criteriaEditorScope";
import { projectCreateIssueDialogHtml as DIALOG } from "./fixtures/projectCreateIssueDialogHtml";

const PROJECT = "/orgs/acme/projects/6";

function scope(pathname: string, search = "") {
	return criteriaEditorScope({ pathname, search });
}

afterEach(() => {
	document.body.innerHTML = "";
});

describe("criteriaEditorScope", () => {
	it("scans the whole document on an issue page", () => {
		expect(scope("/staff0rd/assist/issues/42")).toBe(document);
	});

	it("scans only the create-issue dialog on a project board", () => {
		document.body.innerHTML = `<textarea></textarea>${DIALOG}`;
		expect((scope(PROJECT) as Element).getAttribute("role")).toBe("dialog");
	});

	it("scans the create-issue dialog on a user project view", () => {
		document.body.innerHTML = DIALOG;
		expect(scope("/users/staff0rd/projects/2/views/3")).toBeInstanceOf(
			HTMLElement,
		);
	});

	it("skips a project board with no dialog and no issue pane", () => {
		document.body.innerHTML = "<textarea></textarea>";
		expect(scope(PROJECT)).toBeUndefined();
	});

	it("ignores the dialog outside a project board", () => {
		document.body.innerHTML = DIALOG;
		expect(scope("/staff0rd/assist/pull/2")).toBeUndefined();
	});
});
