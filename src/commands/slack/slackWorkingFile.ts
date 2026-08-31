import { join } from "node:path";
import { getStoreDir } from "../../shared/loadJson";

type SlackWorkingFile = {
	dir: string;
	bodyPath: string;
};

export function slackWorkingFile(channel: string): SlackWorkingFile {
	const slug =
		channel
			.replace(/^[#@]/, "")
			.toLowerCase()
			.replace(/[^a-z0-9._-]+/g, "-")
			.replace(/^-+|-+$/g, "") || "channel";
	const dir = join(getStoreDir(), "slack");
	return { dir, bodyPath: join(dir, `${slug}.md`) };
}
