import type { IPty } from "node-pty";
import { vi } from "vitest";

type ExitEvent = { exitCode: number; signal?: number };

const nonexistentPid = 2 ** 31 - 1;

export function makePty(pid = nonexistentPid) {
	const dataListeners: ((data: string) => void)[] = [];
	const exitListeners: ((e: ExitEvent) => void)[] = [];
	const pty = {
		pid,
		cols: 120,
		rows: 30,
		process: "claude",
		handleFlowControl: false,
		onData: vi.fn((listener: (data: string) => void) => {
			dataListeners.push(listener);
			return { dispose: vi.fn() };
		}),
		onExit: vi.fn((listener: (e: ExitEvent) => void) => {
			exitListeners.push(listener);
			return { dispose: vi.fn() };
		}),
		resize: vi.fn<(columns: number, rows: number) => void>(),
		clear: vi.fn<() => void>(),
		write: vi.fn<(data: string | Buffer) => void>(),
		kill: vi.fn<(signal?: string) => void>(),
		pause: vi.fn<() => void>(),
		resume: vi.fn<() => void>(),
	} satisfies IPty;
	return {
		pty,
		emitData: (data: string) => {
			for (const listener of dataListeners) listener(data);
		},
		exit: (exitCode: number, signal?: number) => {
			for (const listener of exitListeners) listener({ exitCode, signal });
		},
	};
}
