import type { ILink, ILinkProvider, Terminal } from "@xterm/xterm";
import { createLineReader } from "./createWrappedLinkProvider/createLineReader";
import {
	findTerminalLinks,
	strictUrlRegex,
} from "./createWrappedLinkProvider/findTerminalLinks";

export function createWrappedLinkProvider(
	term: Terminal,
	handler: (event: MouseEvent, uri: string) => void,
): ILinkProvider {
	const readLine = createLineReader(term);

	return {
		provideLinks(bufferLineNumber, callback): void {
			const links = findTerminalLinks(
				readLine,
				bufferLineNumber,
				strictUrlRegex,
			);
			callback(
				links.map((link): ILink => ({
					range: link.range,
					text: link.text,
					activate: handler,
				})),
			);
		},
	};
}
