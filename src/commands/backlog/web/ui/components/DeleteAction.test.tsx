// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeleteAction } from "./DeleteAction";
import { DeleteCommentAction } from "./DeleteCommentAction";

const { deleteItem, deleteComment } = vi.hoisted(() => ({
	deleteItem: vi.fn().mockResolvedValue(undefined),
	deleteComment: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../api", () => ({ deleteItem }));
vi.mock("../deleteComment", () => ({ deleteComment }));
vi.mock("../useRepoCwd", () => ({ useRepoCwd: () => undefined }));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

const cases = [
	{
		name: "DeleteAction",
		ui: () => <DeleteAction itemId={7} onDeleted={async () => {}} />,
		trigger: () => screen.getByRole("button", { name: "Delete" }),
		title: "Delete item (Shift skips confirmation)",
		deleted: deleteItem,
	},
	{
		name: "DeleteCommentAction",
		ui: () => (
			<DeleteCommentAction
				itemId={7}
				commentId={3}
				onDeleted={async () => {}}
			/>
		),
		trigger: () => screen.getByRole("button", { name: "Delete comment" }),
		title: "Delete comment (Shift skips confirmation)",
		deleted: deleteComment,
	},
];

describe.each(cases)("$name", ({ ui, trigger, title, deleted }) => {
	it("opens the confirm on a plain click", () => {
		render(ui());
		fireEvent.click(trigger());
		expect(screen.getByRole("dialog")).toBeTruthy();
		expect(deleted).not.toHaveBeenCalled();
	});

	it("deletes without confirming on Shift-click", async () => {
		render(ui());
		fireEvent.click(trigger(), { shiftKey: true });
		expect(screen.queryByRole("dialog")).toBeNull();
		await waitFor(() => expect(deleted).toHaveBeenCalledOnce());
	});

	it("deletes without confirming on Shift+Enter", async () => {
		render(ui());
		fireEvent.keyDown(trigger(), { key: "Enter", shiftKey: true });
		expect(screen.queryByRole("dialog")).toBeNull();
		await waitFor(() => expect(deleted).toHaveBeenCalledOnce());
	});

	it("hints the Shift skip in the tooltip", () => {
		render(ui());
		expect(trigger().getAttribute("title")).toBe(title);
	});
});
