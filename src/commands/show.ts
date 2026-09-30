import { randomUUID } from "node:crypto";
import { readBodyArgument } from "./prs/readBodyArgument";
import { sendShowPreview } from "./sessions/shared/sendShowPreview";

export async function show(options: {
	title?: string;
	body: string;
}): Promise<void> {
	const body = await readBodyArgument(options.body);
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) {
		console.log(body);
		return;
	}

	await sendShowPreview({
		sessionId,
		requestId: randomUUID(),
		title: options.title ?? "Show",
		body,
	});
	console.log("Opened in the assist web UI preview pane.");
}
