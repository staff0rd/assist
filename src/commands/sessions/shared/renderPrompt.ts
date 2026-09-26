export function renderPrompt(raw: string): string {
	const command = marker(raw, "command-name");
	if (command) {
		const args = marker(raw, "command-args");
		const name = `/${command.replace(/^\/+/, "")}`;
		return args ? `${name} ${args}` : name;
	}
	const bashInput = marker(raw, "bash-input");
	if (bashInput) return `! ${bashInput}`;
	return stripBlocks(raw);
}

function marker(raw: string, tag: string): string {
	const match = raw.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
	return match ? match[1].trim() : "";
}

function stripBlocks(raw: string): string {
	return raw
		.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
		.replace(/<task-notification>[\s\S]*?<\/task-notification>/g, "")
		.replace(/<command-[^>]*>[\s\S]*?<\/command-[^>]*>/g, "")
		.replace(/<local-command-[^>]*>[\s\S]*?<\/local-command-[^>]*>/g, "")
		.replace(/<bash-(stdout|stderr)>[\s\S]*?<\/bash-\1>/g, "")
		.trim();
}
