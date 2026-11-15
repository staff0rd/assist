import type { Browser } from "playwright";
import type { DocsScreenshot } from "../docsPageSchema";
import { captureScreenshot } from "./captureScreenshot";
import { startDocsPreview } from "./startDocsPreview";

export async function captureDocsPage(
	browser: Browser,
	screenshot: DocsScreenshot & { docsPage: string },
): Promise<string[]> {
	const preview = await startDocsPreview(
		screenshot.docsPage,
		screenshot.docsEdits ?? [],
	);
	try {
		return await captureScreenshot(
			browser,
			preview.url,
			{ ...screenshot, route: `/${screenshot.docsPage}/` },
			new Map(),
		);
	} finally {
		await preview.stop();
	}
}
