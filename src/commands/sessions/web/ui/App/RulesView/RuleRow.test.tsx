// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PendingRuleChange, RuleScope } from "../../../../../rules/types";
import type { RuleActions } from "./RuleActions";
import { RuleRow } from "./RuleRow";

afterEach(cleanup);

const rule = { code: "R9", title: "Design system", text: "Use tokens." };
const scope: RuleScope = {
	id: "claude-md:ui/",
	kind: "claude-md",
	name: "ui/CLAUDE.md",
	dir: "ui/",
	depth: 1,
	rules: [rule],
};
const userDb: RuleScope = {
	id: "user-db",
	kind: "user-db",
	name: "User (db)",
	depth: 0,
	rules: [],
};

function renderRow(overrides: Partial<RuleActions> = {}) {
	const actions: RuleActions = {
		scopes: [userDb, scope],
		changes: [],
		onPropose: vi.fn().mockResolvedValue(undefined),
		comments: {
			cwd: "/repo",
			onComment: vi.fn(),
			sentTo: null,
			clearSent: () => {},
		},
		...overrides,
	};
	render(
		<ul>
			<RuleRow rule={rule} scope={scope} actions={actions} />
		</ul>,
	);
	return actions;
}

const click = (name: string) =>
	fireEvent.click(screen.getByRole("button", { name }));

describe("RuleRow", () => {
	it("sends a move for approval keeping the rule's wording", async () => {
		const { onPropose } = renderRow();

		click("Move Design system");
		fireEvent.mouseDown(screen.getByRole("combobox"));
		fireEvent.click(screen.getByRole("option", { name: "User (db)" }));
		click("Send for approval");

		await waitFor(() =>
			expect(onPropose).toHaveBeenCalledWith({
				kind: "edit",
				scopeId: "claude-md:ui/",
				rule,
				to: "user-db",
				title: "Design system",
				text: "Use tokens.",
			}),
		);
	});

	it("sends a delete for approval after confirming", async () => {
		const { onPropose } = renderRow();

		click("Delete Design system");
		click("Send for approval");

		await waitFor(() =>
			expect(onPropose).toHaveBeenCalledWith({
				kind: "delete",
				scopeId: "claude-md:ui/",
				rule,
			}),
		);
	});

	it("shows the awaiting approval pill and locks move and delete while pending", () => {
		const pending: PendingRuleChange = {
			id: "1",
			change: { kind: "delete", scopeId: scope.id, rule },
		};
		renderRow({ changes: [pending] });

		expect(screen.getByText("Delete awaiting approval")).toBeTruthy();
		const disabled = (name: string) =>
			(screen.getByRole("button", { name }) as HTMLButtonElement).disabled;
		expect(disabled("Move Design system")).toBe(true);
		expect(disabled("Delete Design system")).toBe(true);
	});
});
