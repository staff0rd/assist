import type { ILink, ILinkProvider, Terminal } from "@xterm/xterm";
import {
	type BufferLineInfo,
	findTerminalLinks,
	strictUrlRegex,
} from "./findTerminalLinks";

export function createWrappedLinkProvider(
	term: Terminal,
	handler: (event: MouseEvent, uri: string) => void,
): ILinkProvider {
	const readLine = (index: number): BufferLineInfo | undefined => {
		const line = term.buffer.active.getLine(index);
		if (!line) return undefined;
		const cols = term.cols;
		const last = line.getCell(cols - 1);
		return {
			text: line.translateToString(true, 0, cols),
			isWrapped: line.isWrapped,
			isFull: !!last && last.getChars() !== "" && last.getChars() !== " ",
		};
	};

	return {
		provideLinks(bufferLineNumber, callback): void {
			const links = findTerminalLinks(
				readLine,
				bufferLineNumber,
				strictUrlRegex,
			);
			callback(
				links.map(
					(link): ILink => ({
						range: link.range,
						text: link.text,
						activate: handler,
					}),
				),
			);
		},
	};
}
