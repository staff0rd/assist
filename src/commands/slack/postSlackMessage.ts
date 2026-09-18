import { mkdirSync, writeFileSync } from "node:fs";
import { loadConfig } from "../../shared/loadConfig";
import { previewSlackThreadParts } from "./previewSlackThreadParts";
import { reviewProposedSlackMessage } from "./reviewProposedSlackMessage";
import { slackWorkingFile } from "./slackWorkingFile";

type PostSlackMessageOptions = {
	body?: string;
	parts?: string[];
	thread?: string;
};

const USAGE =
	"Usage: assist slack post [channel] --body <body|-> | --parts <file>...";

export async function postSlackMessage(
	channelArg: string | undefined,
	options: PostSlackMessageOptions,
): Promise<void> {
	const channel = (channelArg ?? loadConfig().slack?.channel ?? "").trim();
	const body = options.body?.trim();
	const partFiles = options.parts ?? [];
	if (!channel) {
		console.error(
			'No channel given and slack.channel is not set. Pass one, or set a default with: assist config set slack.channel "#general"',
		);
		console.error(USAGE);
		process.exit(1);
	}
	if (body && partFiles.length > 0) {
		console.error("Error: --parts cannot be combined with --body.");
		console.error(USAGE);
		process.exit(1);
	}

	const threadTs = options.thread;
	const target = threadTs ? `${channel} (thread_ts ${threadTs})` : channel;

	if (partFiles.length > 0) {
		await previewSlackThreadParts({ channel, threadTs, target, partFiles });
		return;
	}

	if (!body) {
		console.error(USAGE);
		process.exit(1);
	}

	const { dir, bodyPath } = slackWorkingFile(channel);
	mkdirSync(dir, { recursive: true });
	writeFileSync(bodyPath, `${body}\n`);

	await reviewProposedSlackMessage({ channel, threadTs }, body, bodyPath);

	console.log(`Approved for ${target}. The body to post is at:`);
	console.log(bodyPath);
}
