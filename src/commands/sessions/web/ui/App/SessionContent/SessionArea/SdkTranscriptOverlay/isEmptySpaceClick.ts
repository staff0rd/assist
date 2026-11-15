import { caretFromPoint } from "../../../caretFromPoint";

const INTERACTIVE = [
	"button",
	"a",
	"input",
	"textarea",
	"select",
	"label",
	"summary",
	"[role=button]",
	"[role=link]",
	"[role=menuitem]",
	"[tabindex]",
	"[contenteditable]",
	"[data-preview-skip]",
].join(",");

type ClickPoint = {
	target: EventTarget | null;
	clientX: number;
	clientY: number;
};

function hasSelection(): boolean {
	const selection = globalThis.getSelection?.();
	return Boolean(selection && !selection.isCollapsed);
}

function isInteractive(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest(INTERACTIVE) !== null;
}

function isOnText({ clientX: x, clientY: y }: ClickPoint): boolean {
	const caret = caretFromPoint(x, y);
	if (!caret || caret.node.nodeType !== Node.TEXT_NODE) return false;
	if (!caret.node.textContent?.trim()) return false;
	const range = document.createRange();
	range.selectNodeContents(caret.node);
	return Array.from(range.getClientRects()).some(
		(r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom,
	);
}

export function isEmptySpaceClick(click: ClickPoint): boolean {
	return !hasSelection() && !isInteractive(click.target) && !isOnText(click);
}
