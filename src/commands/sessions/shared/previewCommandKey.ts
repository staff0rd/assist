import type { Command } from "commander";

/* why: the daemon only lets a new preview replace the pending one when both
 * come from the same command for the same target, so each preview command
 * sends this key: its command path plus its first argument (the target id). */
export const previewCommandKey: { value?: string } = {};

export function recordPreviewCommandKey(command: Command): void {
	const path: string[] = [];
	for (let c: Command | null = command; c?.parent; c = c.parent)
		path.unshift(c.name());
	const target =
		command.registeredArguments.length > 0 ? command.args[0] : undefined;
	previewCommandKey.value = [...path, ...(target ? [target] : [])].join(" ");
}
