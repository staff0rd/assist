import { mkdirSync, writeFileSync } from "node:fs";
import { readSlackParts } from "./readSlackParts";
import { reviewProposedSlackMessage } from "./reviewProposedSlackMessage";
import { slackWorkingFile } from "./slackWorkingFile";

type SlackThreadParts = {
	channel: string;
	threadTs?: string;
	target: string;
	partFiles: string[];
};

export async function previewSlackThreadParts({
	channel,
	threadTs,
	target,
	partFiles,
}: SlackThreadParts): Promise<void> {
	const bodies = readSlackParts(partFiles);
	const { dir } = slackWorkingFile(channel);
	mkdirSync(dir, { recursive: true });
	const paths = bodies.map((body, index) => {
		const { bodyPath } = slackWorkingFile(channel, index + 1);
		writeFileSync(bodyPath, `${body}\n`);
		return bodyPath;
	});

	for (const [index, body] of bodies.entries()) {
		await reviewProposedSlackMessage(
			{ channel, threadTs, part: { index: index + 1, total: bodies.length } },
			body,
			paths[index],
		);
	}

	console.log(
		`Approved for ${target}. The ${bodies.length} bodies to post, in thread order, are at:`,
	);
	paths.forEach((path, index) =>
		console.log(`${index + 1}/${paths.length} ${path}`),
	);
	console.log(
		threadTs
			? `Post every part as a reply with thread_ts ${threadTs}.`
			: `Post 1/${paths.length} to ${channel}, then the rest with the thread_ts it returns.`,
	);
}
