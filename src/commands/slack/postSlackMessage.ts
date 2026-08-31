import { mkdirSync, writeFileSync } from "node:fs";
import { reviewProposedSlackMessage } from "./reviewProposedSlackMessage";
import { slackWorkingFile } from "./slackWorkingFile";

type PostSlackMessageOptions = {
	body?: string;
};

const USAGE = "Usage: assist slack post <channel> --body <body|->";

export async function postSlackMessage(
	channelArg: string,
	options: PostSlackMessageOptions,
): Promise<void> {
	const channel = channelArg.trim();
	const body = options.body?.trim();
	if (!channel || !body) {
		console.error(USAGE);
		process.exit(1);
	}

	const { dir, bodyPath } = slackWorkingFile(channel);
	mkdirSync(dir, { recursive: true });
	const write = (text: string) => writeFileSync(bodyPath, `${text}\n`);
	write(body);

	const approved = await reviewProposedSlackMessage(channel, body, {
		path: bodyPath,
		save: write,
	});
	write(approved);

	console.log(`Approved for ${channel}. The body to post is at:`);
	console.log(bodyPath);
}
