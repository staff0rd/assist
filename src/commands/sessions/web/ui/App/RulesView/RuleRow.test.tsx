// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RuleScope } from "../../../../../rules/types";
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

function renderRow(
	onPropose = vi.fn().mockResolvedValue(undefined),
	pending?: Parameters<typeof RuleRow>[0]["pending"],
) {
	render(
		<ul>
			<RuleRow
				rule={rule}
				scope={scope}
				scopes={[userDb, scope]}
				pending={pending}
				onPropose={onPropose}
			/>
		</ul>,
	);
	return onPropose;
}

describe("RuleRow", () => {
	it("sends an edit for approval with the rule it replaces", async () => {
		const onPropose = renderRow();

		fireEvent.click(screen.getByRole("button", { name: "Edit Design system" }));
		fireEvent.change(screen.getByLabelText("Rule"), {
			target: { value: "Use theme tokens." },
		});
		fireEvent.click(screen.getByRole("button", { name: "Send for approval" }));

		await waitFor(() =>
			expect(onPropose).toHaveBeenCalledWith({
				kind: "edit",
				scopeId: "claude-md:ui/",
				rule,
				to: "claude-md:ui/",
				title: "Design system",
				text: "Use theme tokens.",
			}),
		);
		await waitFor(() => expect(screen.queryByLabelText("Rule")).toBeNull());
	});

	it("sends a delete for approval after confirming", async () => {
		const onPropose = renderRow();

		fireEvent.click(
			screen.getByRole("button", { name: "Delete Design system" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Send for approval" }));

		await waitFor(() =>
			expect(onPropose).toHaveBeenCalledWith({
				kind: "delete",
				scopeId: "claude-md:ui/",
				rule,
			}),
		);
	});

	it("keeps the editor open with the error when sending fails", async () => {
		renderRow(vi.fn().mockResolvedValue("Rules in User (db) need a title"));

		fireEvent.click(screen.getByRole("button", { name: "Edit Design system" }));
		fireEvent.click(screen.getByRole("button", { name: "Send for approval" }));

		expect(
			await screen.findByText("Rules in User (db) need a title"),
		).toBeTruthy();
	});

	it("shows the awaiting approval pill and locks the rule while pending", () => {
		renderRow(undefined, {
			id: "1",
			change: {
				kind: "edit",
				scopeId: scope.id,
				rule,
				to: "user-db",
				text: "x",
			},
		});

		expect(screen.getByText("Move awaiting approval")).toBeTruthy();
		expect(
			(
				screen.getByRole("button", {
					name: "Edit Design system",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});
});
