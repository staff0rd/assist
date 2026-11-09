export function inboxFlagInstructions(): string[] {
	return [
		"Do not flag purely automated messages with no person-written message to me: bots, apps, CI, calendars, ticketing, monitoring, newsletters or mailing lists.",
		'A notification email that relays a message a person wrote to me (such as a Teams chat @mention or reply, "<Name> mentioned you in your chat") is a person\'s message, not an automated one: judge the relayed message like any other and flag it when it needs my reply or action, even when it comes from a no-reply address.',
		"Flag messages a person wrote to me that need me to reply or act. That includes messages that hand me something to act on without asking a question, such as a credential or secret to retrieve, a document to review, or a deadline to meet.",
		"Judge each message on its full content, never on a search snippet alone.",
		"",
		"For each flagged message return:",
		'- source: "gmail" or "slack"',
		"- messageId: the Gmail message id, or for Slack <channel_id>:<message ts>",
		"- sender: the sender's name; for a relayed message, the person who wrote it, never the notification address or service",
		"- summary: one sentence on the reply or action it needs from me",
		"- link: the Gmail message viewUrl or the Slack permalink",
		"- receivedAt: when it was sent, as an ISO 8601 timestamp",
		"",
		"Return an empty messages array when nothing needs my reply or action.",
	];
}
