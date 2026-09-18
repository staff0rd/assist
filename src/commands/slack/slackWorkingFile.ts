import { join } from "node:path";
import { getStoreDir } from "../../shared/loadJson";

type SlackWorkingFile = {
	dir: string;
	bodyPath: string;
};

export function slackWorkingFile(
	channel: string,
	partIndex?: number,
): SlackWorkingFile {
	const slug =
		channel
			.replace(/^[#@]/, "")
			.toLowerCase()
			.replace(/[^a-z0-9._-]+/g, "-")
			.replace(/^-+|-+$/g, "") || "channel";
	const dir = join(getStoreDir(), "slack");
	const name = partIndex === undefined ? slug : `${slug}-${partIndex}`;
	return { dir, bodyPath: join(dir, `${name}.md`) };
}
