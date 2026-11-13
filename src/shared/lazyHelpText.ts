import type { Command } from "commander";

type HelpTextLoader = () => Promise<() => string>;

const preloaders: (() => Promise<void>)[] = [];

export function lazyHelpText(command: Command, load: HelpTextLoader): Command {
	let render: (() => string) | undefined;
	preloaders.push(async () => {
		render = await load();
	});
	return command.addHelpText("after", () => render?.() ?? "");
}

export async function preloadHelpText(): Promise<void> {
	await Promise.all(preloaders.map((preload) => preload()));
}
