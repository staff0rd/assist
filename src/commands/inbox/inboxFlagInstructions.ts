export function inboxFlagInstructions(): string[] {
	return [
		"Do not flag anything from bots, apps, automated or notification systems (CI, calendars, ticketing, monitoring, no-reply addresses), newsletters or mailing lists.",
		"Flag messages a person wrote to me that need me to reply or act. That includes messages that hand me something to act on without asking a question, such as a credential or secret to retrieve, a document to review, or a deadline to meet.",
		"Judge each message on its full content, never on a search snippet alone.",
		"",
		"For each flagged message return:",
		'- source: "gmail" or "slack"',
		"- messageId: the Gmail message id, or for Slack <channel_id>:<message ts>",
		"- sender: the sender's name",
		"- summary: one sentence on the reply or action it needs from me",
		"- link: the Gmail message viewUrl or the Slack permalink",
		"- receivedAt: when it was sent, as an ISO 8601 timestamp",
		"",
		"Return an empty messages array when nothing needs my reply or action.",
	];
}
