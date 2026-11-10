const GROUP_HEADER = /^\s*\[\[\s*hooks\.([A-Za-z]+)\s*\]\]\s*(#.*)?$/;
const HANDLER_HEADER = /^\s*\[\[\s*hooks\.([A-Za-z]+)\.hooks\s*\]\]\s*(#.*)?$/;
const COMMAND = /^\s*command\s*=\s*("(?:[^"\\]|\\.)*")\s*(#.*)?$/;

function snakeCase(event: string): string {
	return event.replace(/(?<!^)([A-Z])/g, "_$1").toLowerCase();
}

function countGroups(toml: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const line of toml.split("\n")) {
		const event = GROUP_HEADER.exec(line)?.[1];
		if (event) counts.set(event, (counts.get(event) ?? 0) + 1);
	}
	return counts;
}

export function assistCodexHookKeys(
	before: string,
	body: string,
): Map<string, string> {
	const groups = countGroups(before);
	const keys = new Map<string, string>();
	let suffix: string | undefined;
	let group = -1;
	let handler = -1;
	for (const line of body.split("\n")) {
		const groupEvent = GROUP_HEADER.exec(line)?.[1];
		if (groupEvent) {
			group = groups.get(groupEvent) ?? 0;
			groups.set(groupEvent, group + 1);
			handler = -1;
			suffix = undefined;
			continue;
		}
		const handlerEvent = HANDLER_HEADER.exec(line)?.[1];
		if (handlerEvent) {
			handler++;
			suffix = `${snakeCase(handlerEvent)}:${group}:${handler}`;
			continue;
		}
		const command = COMMAND.exec(line)?.[1];
		if (command && suffix) keys.set(suffix, JSON.parse(command));
	}
	return keys;
}
