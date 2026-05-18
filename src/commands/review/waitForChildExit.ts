import type { ChildProcess } from "node:child_process";
import { handleChildClose } from "./handleChildClose";
import { handleSpawnError } from "./handleSpawnError";

export type ExitResult = {
	exitCode: number;
	stderr: string;
	elapsedMs: number;
};

type ExitContext = {
	child: ChildProcess;
	flushPending: () => void;
	stderr: { value: string };
	name: string;
	command: string;
	startedAt: number;
	quiet: boolean;
};

function onErrorResult(
	ctx: ExitContext,
	err: NodeJS.ErrnoException,
): ExitResult {
	ctx.flushPending();
	return handleSpawnError(
		{
			command: ctx.command,
			name: ctx.name,
			stderr: ctx.stderr.value,
			startedAt: ctx.startedAt,
			quiet: ctx.quiet,
		},
		err,
	);
}

function onCloseResult(ctx: ExitContext, code: number | null): ExitResult {
	ctx.flushPending();
	const closed = handleChildClose({
		code,
		startedAt: ctx.startedAt,
		name: ctx.name,
		stderr: ctx.stderr.value,
		quiet: ctx.quiet,
	});
	return { ...closed, stderr: ctx.stderr.value };
}

export function waitForChildExit(ctx: ExitContext): Promise<ExitResult> {
	return new Promise((resolve) => {
		let settled = false;
		const settle = (result: ExitResult) => {
			if (settled) return;
			settled = true;
			resolve(result);
		};
		ctx.child.on("error", (err) => settle(onErrorResult(ctx, err)));
		ctx.child.on("close", (code) => settle(onCloseResult(ctx, code)));
	});
}
