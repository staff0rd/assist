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
	sessionId: string,
	{ cols, rows }: XtermSize,
	fontSize: number,
	onOutput: OnOutput,
	onWrite: () => void,
): void {
	const { tokens } = useTheme();
	const termRef = useRef<Terminal | null>(null);
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
	}, [hostRef, sessionId, onOutput]);

	useEffect(() => {
		termRef.current?.resize(cols, rows);
	}, [cols, rows]);

	useEffect(() => {
		const term = termRef.current;
		if (term)
			Object.assign(term.options, { ...terminalTheme(tokens), fontSize });
	}, [tokens, fontSize]);
}
