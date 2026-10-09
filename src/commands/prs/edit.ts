import { appendScreenshots } from "./appendScreenshots";
import { applyEdit } from "./applyEdit";
import { editPrBody } from "./editPrBody";
import { parseScreenshotSpecs } from "./parseScreenshotSpecs";
import { previewAndApplyEdit } from "./previewAndApplyEdit";
import { getCurrentPr } from "./shared";
import { validatePrContent } from "./validatePrContent";

type EditOptions = {
	title?: string;
	what?: string;
	why?: string;
	how?: string;
	resolves?: string[];
	screenshot?: string[];
};

export async function edit(options: EditOptions): Promise<void> {
	const hasResolves = (options.resolves?.length ?? 0) > 0;
	const hasSection =
		options.what !== undefined ||
		options.why !== undefined ||
		options.how !== undefined ||
		hasResolves;
	const screenshots = parseScreenshotSpecs(options.screenshot);

	if (!options.title && !hasSection && screenshots.length === 0) {
		console.error(
			"Usage: assist prs edit [--title <title>] [--what <what>] [--why <why>] [--how <how>] [--resolves <key>] [--screenshot '[Group/]Caption=path']",
		);
		process.exit(1);
	}

	const { number, title, body } = getCurrentPr();
	const newBody = editPrBody(body, options);
	validatePrContent(options.title ?? "", newBody);

	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION === "1" && sessionId) {
		await previewAndApplyEdit({
			sessionId,
			number,
			title: options.title,
			currentTitle: title,
			body: newBody,
			screenshots,
		});
		return;
	}

	applyEdit(
		number,
		options.title,
		appendScreenshots(newBody, screenshots),
		screenshots,
	);
}
