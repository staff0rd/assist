const WHEEL_UP = 64;
const WHEEL_DOWN = 65;
const X10_MAX = 223;

export function encodeWheelReport(
	up: boolean,
	col: number,
	row: number,
	sgr: boolean,
): string {
	const button = up ? WHEEL_UP : WHEEL_DOWN;
	if (sgr) return `\x1b[<${button};${col};${row}M`;
	const byte = (n: number) => String.fromCharCode(32 + n);
	return `\x1b[M${byte(button)}${byte(Math.min(col, X10_MAX))}${byte(Math.min(row, X10_MAX))}`;
}
