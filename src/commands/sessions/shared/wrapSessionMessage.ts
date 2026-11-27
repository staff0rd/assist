function attribute(value: string): string {
	return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function wrapSessionMessage(
	text: string,
	from: string,
	agent?: string,
): string {
	const agentAttr = agent ? ` agent="${attribute(agent)}"` : "";
	return `<session-message from="${attribute(from)}"${agentAttr}>${text}</session-message>`;
}
