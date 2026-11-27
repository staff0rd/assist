export type SessionMessage = { from: string; agent?: string; body: string };

const TAG =
	/^\s*<session-message from="([^"]*)"(?: agent="([^"]*)")?>([\s\S]*)<\/session-message>\s*$/;

function unescapeAttribute(value: string): string {
	return value.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

export function parseSessionMessage(text: string): SessionMessage | null {
	const match = TAG.exec(text);
	if (!match) return null;
	const [, from, agent, body] = match;
	return {
		from: unescapeAttribute(from),
		...(agent !== undefined && { agent: unescapeAttribute(agent) }),
		body: body.trim(),
	};
}

export function sessionMessageBody(text: string): string {
	return parseSessionMessage(text)?.body ?? text;
}
