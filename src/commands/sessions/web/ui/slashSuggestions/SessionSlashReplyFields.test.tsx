// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import {
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { CommentNoteForm } from "../App/SelectionCommentPopover/SelectionCommentBody/CommentNoteForm";
import { CheckNoteField } from "../App/SessionContent/PrPreviewSlideInPane/CheckPane/CheckNoteField";
import { QueuedCommentEditor } from "../App/SessionContent/PrPreviewSlideInPane/HighLevelReviewPane/HighLevelReviewQueue/QueuedCommentEditor";
import { QuestionOtherRow } from "../App/SessionContent/PrPreviewSlideInPane/QuestionPane/QuestionOtherRow";

vi.mock("./useSessionSlashCommands", () => ({
	useSessionSlashCommands: () => [
		{ name: "draft", scope: "user" },
		{ name: "dream", scope: "project" },
	],
}));

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

type Spies = {
	submit: Mock<(note?: string) => void>;
	cancel: Mock<() => void>;
};

function QuestionOther({ submit }: Spies) {
	const [text, setText] = useState("");
	return (
		<QuestionOtherRow
			name="q"
			question={{
				question: "Which?",
				header: "Pick",
				multiSelect: false,
				options: [],
			}}
			choice={{ labels: [], otherOn: true, otherText: text }}
			onPickOther={() => {}}
			onOtherText={setText}
			onSubmit={submit}
		/>
	);
}

function CheckNote() {
	const [note, setNote] = useState("");
	return <CheckNoteField value={note} onChange={setNote} />;
}

const fields: [string, (spies: Spies) => ReactElement][] = [
	["ask-question Other answer", (s) => <QuestionOther {...s} />],
	["check note", () => <CheckNote />],
	[
		"selection comment form",
		(s) => <CommentNoteForm onAdd={s.submit} onCancel={s.cancel} />,
	],
	[
		"queued review comment editor",
		(s) => (
			<QueuedCommentEditor
				initial=""
				label="Edit comment"
				onSave={s.submit}
				onCancel={s.cancel}
			/>
		),
	],
];

function setup(make: (spies: Spies) => ReactElement) {
	const spies: Spies = { submit: vi.fn(), cancel: vi.fn() };
	const onOuterKey = vi.fn();
	render(<div onKeyDown={(e) => onOuterKey(e.key)}>{make(spies)}</div>);
	const field = screen.getByRole("textbox") as HTMLTextAreaElement;
	const type = (value: string) =>
		fireEvent.change(field, {
			target: {
				value,
				selectionStart: value.length,
				selectionEnd: value.length,
			},
		});
	return { ...spies, field, type, onOuterKey };
}

describe.each(fields)("%s slash suggestions", (_name, make) => {
	it("inserts the highlighted skill on Enter without submitting", () => {
		const { field, type, submit } = setup(make);
		type("/dr");
		expect(screen.getByRole("listbox")).toBeTruthy();
		fireEvent.keyDown(field, { key: "Enter" });
		expect(field.value).toBe("/draft ");
		expect(submit).not.toHaveBeenCalled();
	});

	it("inserts the highlighted skill on Tab after moving down", () => {
		const { field, type } = setup(make);
		type("/dr");
		fireEvent.keyDown(field, { key: "ArrowDown" });
		fireEvent.keyDown(field, { key: "Tab" });
		expect(field.value).toBe("/dream ");
	});

	it("closes the list on Esc without the key reaching the parent", () => {
		const { field, type, cancel, onOuterKey } = setup(make);
		type("/dr");
		fireEvent.keyDown(field, { key: "Escape" });
		expect(screen.queryByRole("listbox")).toBeNull();
		expect(cancel).not.toHaveBeenCalled();
		expect(onOuterKey).not.toHaveBeenCalled();
	});

	it("leaves Shift+Enter alone with no list open", () => {
		const { field, type, submit } = setup(make);
		type("note");
		const event = fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
		expect(event).toBe(true);
		expect(submit).not.toHaveBeenCalled();
	});
});

describe("with no list open", () => {
	it("submits the Other answer on Enter", () => {
		const { field, type, submit } = setup(fields[0][1]);
		type("my answer");
		fireEvent.keyDown(field, { key: "Enter" });
		expect(submit).toHaveBeenCalledTimes(1);
	});

	it("keeps Enter as a new line in the check note", () => {
		const { field, type, onOuterKey } = setup(fields[1][1]);
		type("a note");
		expect(fireEvent.keyDown(field, { key: "Enter" })).toBe(true);
		fireEvent.keyDown(field, { key: "Escape" });
		expect(onOuterKey).toHaveBeenCalledWith("Escape");
	});

	it("sends the selection comment on Enter", () => {
		const { field, type, submit } = setup(fields[2][1]);
		type("rename this");
		fireEvent.keyDown(field, { key: "Enter" });
		expect(submit).toHaveBeenCalledWith("rename this");
	});

	it("saves the queued comment on Enter and cancels on Esc", () => {
		const { field, type, submit, cancel } = setup(fields[3][1]);
		type("tidy up");
		fireEvent.keyDown(field, { key: "Enter" });
		expect(submit).toHaveBeenCalledWith("tidy up");
		fireEvent.keyDown(field, { key: "Escape" });
		expect(cancel).toHaveBeenCalledTimes(1);
	});
});
