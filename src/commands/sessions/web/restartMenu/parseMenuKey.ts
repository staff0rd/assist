type MenuKey =
	| "up"
	| "down"
	| "select"
	| "dismiss"
	| "toggle"
	| "quit"
	| "digit"
	| "none";

type ParsedKey = { key: MenuKey; digit?: number };

const CTRL_C = String.fromCharCode(3);
const ESC = String.fromCharCode(27);
const ARROW_UP = `${ESC}[A`;
const ARROW_DOWN = `${ESC}[B`;
// Terminals in application-cursor-keys mode (DECCKM) send ESC O A/B instead.
const ARROW_UP_APP = `${ESC}OA`;
const ARROW_DOWN_APP = `${ESC}OB`;

export function parseMenuKey(data: string, toggleKey: string): ParsedKey {
	if (data === toggleKey) return { key: "toggle" };
	switch (data) {
		case CTRL_C:
			return { key: "quit" };
		case ESC:
			return { key: "dismiss" };
		case "\r":
		case "\n":
			return { key: "select" };
		case ARROW_UP:
		case ARROW_UP_APP:
			return { key: "up" };
		case ARROW_DOWN:
		case ARROW_DOWN_APP:
			return { key: "down" };
	}
	if (/^[1-9]$/.test(data)) return { key: "digit", digit: Number(data) };
	return { key: "none" };
}
