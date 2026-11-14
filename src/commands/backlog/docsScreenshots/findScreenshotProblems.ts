import { join } from "node:path";
import { getProjectRoot } from "../../../shared/loadConfig";
import { checkStoryScreenshots } from "./checkStoryScreenshots";
import { listChangedScreenshots } from "./listChangedScreenshots";
import { listDeclaredScreenshots } from "./listDeclaredScreenshots";

const PAGES_DIR = join("docs", "src", "content", "docs");
const SCREENSHOTS_DIR = join("docs", "public", "screenshots");

export function findScreenshotProblems(
	uiStoryIds: number[],
	mappings: Map<number, string[]>,
): string[] {
	const root = getProjectRoot();
	return checkStoryScreenshots({
		uiStoryIds,
		mappings,
		declared: listDeclaredScreenshots(join(root, PAGES_DIR)),
		changed: listChangedScreenshots(root, SCREENSHOTS_DIR),
	});
}
