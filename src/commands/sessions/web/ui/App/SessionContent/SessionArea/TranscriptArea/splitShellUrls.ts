import { strictUrlRegex } from "../TerminalArea/TerminalPanes/TerminalPane/useTerminal/createTerminal/createWrappedLinkProvider/findTerminalLinks";

type ShellSegment = { kind: "text" | "url"; text: string };

export function splitShellUrls(text: string): ShellSegment[] {
	const segments: ShellSegment[] = [];
	let last = 0;
	for (const match of text.matchAll(new RegExp(strictUrlRegex.source, "g"))) {
		if (match.index > last)
			segments.push({ kind: "text", text: text.slice(last, match.index) });
		segments.push({ kind: "url", text: match[0] });
		last = match.index + match[0].length;
	}
	if (last < text.length)
		segments.push({ kind: "text", text: text.slice(last) });
	return segments;
}
