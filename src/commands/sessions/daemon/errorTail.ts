const ESC = String.fromCharCode(0x1b);
const CSI = String.fromCharCode(0x9b);
const BEL = String.fromCharCode(0x07);

const ANSI = new RegExp(
	String.raw`[${ESC}${CSI}][[\]()#;?]*(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?${BEL}|(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~])`,
	"g",
);

const MAX_TAIL_LINES = 40;
const MAX_TAIL_CHARS = 4000;

export function stripAnsi(text: string): string {
	return text.replace(ANSI, "");
}

export function errorTail(scrollback: string): string {
	const clean = stripAnsi(scrollback)
		.replace(/\r\n?/g, "\n")
		.replace(/[ \t]+\n/g, "\n")
		.trimEnd();
	if (clean.length === 0) return "";
	const tail = clean.split("\n").slice(-MAX_TAIL_LINES).join("\n");
	return tail.length > MAX_TAIL_CHARS ? tail.slice(-MAX_TAIL_CHARS) : tail;
}
