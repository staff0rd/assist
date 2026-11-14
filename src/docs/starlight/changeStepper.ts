import type { ChangeLoop } from "./changeLoop";
import { changeSteps } from "./changeSteps";
import { doneCursor } from "./doneCursor";
import type { DoneStore } from "./doneStore";
import { reopenOnComment } from "./reopenOnComment";
import { remainingStatus } from "./remainingStatus";
import { startAtHash } from "./startAtHash";
import { stepperButton } from "./stepperButton";

type StepperContext = {
	loop: ChangeLoop;
	store: DoneStore;
	go: (href: string) => void;
	onRefresh: () => void;
};

export function changeStepper(
	doc: Document,
	changes: Element[][],
	{ loop, store, go, onRefresh }: StepperContext,
) {
	const position = doc.createElement("span");
	const remaining = doc.createElement("span");
	const previous = stepperButton(doc, "Previous change", "‹");
	const next = stepperButton(doc, "Next change", "›");
	const done = stepperButton(doc, "Mark done and go to next change", "✓ ›");
	previous.disabled = changes.length === 0 && !loop.previous;
	const cursor = doneCursor(loop.page.id, changes, position, store);
	const steps = changeSteps(cursor, changes.length, loop, go);
	const refresh = () => {
		const left = cursor.left();
		store.setLeft(loop.page, left);
		remaining.textContent = remainingStatus(left, loop.elsewhere());
		const allDone = remaining.textContent === "All changes done";
		next.disabled = allDone;
		done.disabled = allDone;
		onRefresh();
	};
	const leave = (isDone: boolean) => {
		cursor.setCurrentDone(isDone);
		refresh();
		steps.next();
	};
	previous.addEventListener("click", steps.previous);
	next.addEventListener("click", () => leave(false));
	done.addEventListener("click", () => leave(true));
	reopenOnComment(doc, changes, (index) => {
		cursor.reopen(index);
		refresh();
	});
	refresh();
	startAtHash(doc.location.hash, changes.length, steps, cursor);
	return [previous, position, next, done, remaining];
}
