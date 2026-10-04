import { stripAnsi } from "../../../../shared/stripAnsi";

export function lineRecorder(
	onLine: (line: string) => void,
): (text: string) => void {
	let pending = "";
	return (text) => {
		const lines = (pending + text).split(/\r?\n|\r/);
		pending = lines.pop() ?? "";
		for (const line of lines) {
			const clean = stripAnsi(line).trimEnd();
			if (clean.trim()) onLine(clean);
		}
	};
}
