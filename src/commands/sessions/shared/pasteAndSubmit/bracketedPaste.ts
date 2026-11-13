const ESC = String.fromCharCode(27);
const PASTE_START = `${ESC}[200~`;
const PASTE_END = `${ESC}[201~`;

export const SUBMIT = "\r";

export function bracketedPaste(text: string): string {
	return `${PASTE_START}${text.replace(/\r?\n/g, SUBMIT)}${PASTE_END}`;
}

export function unwrapBracketedPaste(data: string): string | undefined {
	if (!data.startsWith(PASTE_START) || !data.endsWith(PASTE_END))
		return undefined;
	return data
		.slice(PASTE_START.length, data.length - PASTE_END.length)
		.replaceAll(SUBMIT, "\n");
}
