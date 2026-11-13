import type { KeyboardEvent } from "react";
import { slashKeyAction } from "./slashKeyAction";

type Nav = { move: (step: number) => void; dismiss: () => void };

export function handleSlashKey(
	e: KeyboardEvent,
	nav: Nav,
	insert: () => void,
): boolean {
	const action = slashKeyAction(e);
	if (!action) return false;
	e.preventDefault();
	if (action === "next") nav.move(1);
	else if (action === "previous") nav.move(-1);
	else if (action === "insert") insert();
	else nav.dismiss();
	return true;
}
