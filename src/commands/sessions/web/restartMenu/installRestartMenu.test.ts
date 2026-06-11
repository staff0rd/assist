import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installRestartMenu } from "./installRestartMenu";

const CTRL_R = String.fromCharCode(18);
const CTRL_C = String.fromCharCode(3);
const ESC = String.fromCharCode(27);
const ARROW_UP = `${ESC}[A`;
const ARROW_DOWN = `${ESC}[B`;

function createStdin(isTTY = true) {
	const stdin = new EventEmitter() as unknown as NodeJS.ReadStream & {
		setRawMode: ReturnType<typeof vi.fn>;
		resume: ReturnType<typeof vi.fn>;
		pause: ReturnType<typeof vi.fn>;
		setEncoding: ReturnType<typeof vi.fn>;
	};
	Object.assign(stdin, {
		isTTY,
		isRaw: false,
		setRawMode: vi.fn((raw: boolean) => {
			(stdin as unknown as { isRaw: boolean }).isRaw = raw;
			return stdin;
		}),
		resume: vi.fn(),
		pause: vi.fn(),
		setEncoding: vi.fn(),
	});
	return stdin;
}

function flush(): Promise<void> {
	return new Promise((resolve) => setImmediate(resolve));
}

describe("installRestartMenu", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	function setup() {
		const stdin = createStdin();
		const out = new PassThrough();
		const exit = vi.fn();
		const restartDaemonFn = vi.fn(() => Promise.resolve());
		const reExecFn = vi.fn();
		const cleanup = installRestartMenu({
			stdin,
			out: out as unknown as NodeJS.WriteStream,
			exit,
			restartDaemonFn,
			reExecFn,
		});
		return { stdin, exit, restartDaemonFn, reExecFn, cleanup };
	}

	it("does nothing when stdin is not a TTY", () => {
		const stdin = createStdin(false);
		installRestartMenu({ stdin, restartDaemonFn: vi.fn() });
		expect(stdin.setRawMode).not.toHaveBeenCalled();
	});

	it("enables raw mode while serving", () => {
		const { stdin } = setup();
		expect(stdin.setRawMode).toHaveBeenCalledWith(true);
		expect(stdin.resume).toHaveBeenCalled();
	});

	it("restarts the daemon when the daemon item is selected with Enter", async () => {
		const { stdin, restartDaemonFn } = setup();
		stdin.emit("data", CTRL_R);
		stdin.emit("data", "\r");
		await flush();
		expect(restartDaemonFn).toHaveBeenCalledOnce();
	});

	it("restarts the daemon via the number key", async () => {
		const { stdin, restartDaemonFn } = setup();
		stdin.emit("data", CTRL_R);
		stdin.emit("data", "1");
		await flush();
		expect(restartDaemonFn).toHaveBeenCalledOnce();
	});

	it("ignores keys until the menu is toggled open", async () => {
		const { stdin, restartDaemonFn } = setup();
		stdin.emit("data", "\r");
		await flush();
		expect(restartDaemonFn).not.toHaveBeenCalled();
	});

	it("re-execs the web server when the webserver item is selected", async () => {
		const { stdin, restartDaemonFn, reExecFn } = setup();
		stdin.emit("data", CTRL_R);
		stdin.emit("data", "2");
		await flush();
		expect(reExecFn).toHaveBeenCalledOnce();
		expect(restartDaemonFn).not.toHaveBeenCalled();
	});

	it("restarts the daemon then re-execs for Restart both", async () => {
		const { stdin, restartDaemonFn, reExecFn } = setup();
		stdin.emit("data", CTRL_R);
		stdin.emit("data", "3");
		await flush();
		expect(restartDaemonFn).toHaveBeenCalledOnce();
		expect(reExecFn).toHaveBeenCalledOnce();
		expect(restartDaemonFn.mock.invocationCallOrder[0]).toBeLessThan(
			reExecFn.mock.invocationCallOrder[0],
		);
	});

	it("navigates with arrow keys back to an enabled item before running", async () => {
		const { stdin, restartDaemonFn } = setup();
		stdin.emit("data", CTRL_R);
		stdin.emit("data", ARROW_DOWN);
		stdin.emit("data", ARROW_UP);
		stdin.emit("data", "\r");
		await flush();
		expect(restartDaemonFn).toHaveBeenCalledOnce();
	});

	it("closes the menu on Esc without acting", async () => {
		const { stdin, restartDaemonFn } = setup();
		stdin.emit("data", CTRL_R);
		stdin.emit("data", ESC);
		stdin.emit("data", "\r");
		await flush();
		expect(restartDaemonFn).not.toHaveBeenCalled();
	});

	it("quits and restores the terminal on Ctrl+C", () => {
		const { stdin, exit } = setup();
		stdin.emit("data", CTRL_C);
		expect(exit).toHaveBeenCalledWith(130);
		expect(stdin.setRawMode).toHaveBeenLastCalledWith(false);
	});

	it("restores the terminal on cleanup", () => {
		const { stdin, cleanup } = setup();
		cleanup();
		expect(stdin.setRawMode).toHaveBeenLastCalledWith(false);
		expect(stdin.pause).toHaveBeenCalled();
	});
});
