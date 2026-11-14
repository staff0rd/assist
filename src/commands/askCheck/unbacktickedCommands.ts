import { stepProse } from "./stepProse";

const commandPattern = /https?:\/\/\S+|www\.\S+|(?<=^|\s)--?[a-z][\w-]*/gi;
const linkTarget = /\]\([^)]*\)/g;

export function unbacktickedCommands(step: string): string[] {
	const prose = stepProse(step).replace(linkTarget, "]");
	return prose.match(commandPattern) ?? [];
}
