import { mkdirSync, writeFileSync } from "node:fs";
import { loadConfig } from "../../shared/loadConfig";
import { reviewProposedSlackMessage } from "./reviewProposedSlackMessage";
import { slackWorkingFile } from "./slackWorkingFile";

type PostSlackMessageOptions = {
	body?: string;
	thread?: string;
};

const USAGE = "Usage: assist slack post [channel] --body <body|->";

export async function postSlackMessage(
	channelArg: string | undefined,
	options: PostSlackMessageOptions,
): Promise<void> {
	const channel = (channelArg ?? loadConfig().slack?.channel ?? "").trim();
	const body = options.body?.trim();
	if (!channel) {
		console.error(
			'No channel given and slack.channel is not set. Pass one, or set a default with: assist config set slack.channel "#general"',
		);
		console.error(USAGE);
		process.exit(1);
	}
	if (!body) {
		console.error(USAGE);
		process.exit(1);
	}

	const threadTs = options.thread;
	const { dir, bodyPath } = slackWorkingFile(channel);
	mkdirSync(dir, { recursive: true });
	const write = (text: string) => writeFileSync(bodyPath, `${text}\n`);
	write(body);

	const approved = await reviewProposedSlackMessage(
		{ channel, threadTs },
		body,
		{ path: bodyPath, save: write },
	);
	write(approved);

	const target = threadTs ? `${channel} (thread_ts ${threadTs})` : channel;
	console.log(`Approved for ${target}. The body to post is at:`);
	console.log(bodyPath);
}
