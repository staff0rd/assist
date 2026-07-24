import { recordSessionRefs } from "../../shared/db/recordSessionRefs";

export async function recordSlack(
	url: string,
	options: { title?: string },
): Promise<void> {
	await recordSessionRefs([
		{ kind: "slack", ref: url, url, title: options.title },
	]);
}
