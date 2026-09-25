const ESC = String.fromCharCode(27);
const PASTE_START = `${ESC}[200~`;
const PASTE_END = `${ESC}[201~`;

export const SUBMIT = "\r";

export function bracketedPaste(text: string): string {
	return `${PASTE_START}${text.replace(/\r?\n/g, SUBMIT)}${PASTE_END}`;
}
