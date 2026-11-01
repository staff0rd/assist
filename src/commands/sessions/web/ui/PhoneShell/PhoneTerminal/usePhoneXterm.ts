import { useTheme } from "@mui/material/styles";
import { Terminal } from "@xterm/xterm";
import { type RefObject, useEffect, useRef } from "react";
import { terminalTheme } from "../../App/SessionContent/SessionArea/TerminalArea/TerminalPanes/TerminalPane/useTerminal/terminalTheme";

type OnOutput = (
	sessionId: string,
	handler: (data: string) => void,
) => () => void;

type XtermSize = { cols: number; rows: number };

export function usePhoneXterm(
	hostRef: RefObject<HTMLDivElement | null>,
	termRef: RefObject<Terminal | null>,
	sessionId: string,
	{ cols, rows }: XtermSize,
	fontSize: number,
	onOutput: OnOutput,
	onWrite: () => void,
): void {
	const { tokens } = useTheme();
	const initial = useRef({ tokens, fontSize, cols, rows });
	const onWriteRef = useRef(onWrite);
	onWriteRef.current = onWrite;

	useEffect(() => {
		const el = hostRef.current;
		if (!el) return;
		const { tokens: t, ...size } = initial.current;
		const term = new Terminal({
			...terminalTheme(t),
			...size,
			disableStdin: true,
			cursorBlink: false,
			scrollback: 5000,
		});
		term.open(el);
		termRef.current = term;
		const unsubscribe = onOutput(sessionId, (data) =>
			term.write(data, () => onWriteRef.current()),
		);
		return () => {
			unsubscribe();
			term.dispose();
			termRef.current = null;
		};
	}, [hostRef, termRef, sessionId, onOutput]);

	useEffect(() => {
		termRef.current?.resize(cols, rows);
	}, [termRef, cols, rows]);

	useEffect(() => {
		const term = termRef.current;
		if (term)
			Object.assign(term.options, { ...terminalTheme(tokens), fontSize });
	}, [termRef, tokens, fontSize]);
}
