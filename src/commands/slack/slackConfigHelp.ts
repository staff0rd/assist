import type { ConfigHelpEntry } from "../../shared/configHelp";

export const slackConfigHelp: ConfigHelpEntry[] = [
	{
		key: "slack.channel",
		setter: 'assist config set slack.channel "#general"',
		note: "channel 'assist slack post' targets when no [channel] argument is given",
	},
];
