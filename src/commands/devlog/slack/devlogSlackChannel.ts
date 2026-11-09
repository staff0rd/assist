import { loadConfig } from "../../../shared/loadConfig";

export function devlogSlackChannel(): string {
	const config = loadConfig();
	const channel =
		config.devlog?.slack?.trim() || config.slack?.channel?.trim() || "";
	if (!channel) {
		console.error(
			'No devlog channel configured. Set devlog.slack or slack.channel, e.g.: assist config set devlog.slack "#devlog"',
		);
		process.exit(1);
	}
	return channel;
}
