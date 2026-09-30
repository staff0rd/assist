import { randomUUID } from "node:crypto";
import { readBodyArgument } from "./prs/readBodyArgument";
import { sendShowPreview } from "./sessions/shared/sendShowPreview";

export async function show(options: {
	title?: string;
	body: string;
}): Promise<void> {
	const body = await readBodyArgument(options.body);
	if (body.trim().length === 0) {
		console.error("Error: --body is empty; there is nothing to show.");
		process.exit(1);
	}
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) {
		console.log(body);
		return;
	}

	try {
		await sendShowPreview({
			sessionId,
			requestId: randomUUID(),
			title: options.title ?? "Show",
			body,
		});
	} catch (error) {
		console.error(`Error: ${(error as Error).message}`);
		process.exit(1);
	}
	console.log("Opened in the assist web UI preview pane.");
}
