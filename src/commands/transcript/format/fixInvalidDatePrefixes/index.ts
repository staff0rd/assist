import { dirname, join } from "node:path";
import { isValidDatePrefix } from "../../shared";
import type { VttFileInfo } from "../../types";
import { promptForDateFix } from "./promptForDateFix";

export async function fixInvalidDatePrefixes(
	vttFiles: VttFileInfo[],
): Promise<VttFileInfo[]> {
	for (let i = 0; i < vttFiles.length; i++) {
		const vttFile = vttFiles[i];
		if (!isValidDatePrefix(vttFile.filename)) {
			const vttFileDir = dirname(vttFile.absolutePath);
			const newFilename = await promptForDateFix(vttFile.filename, vttFileDir);
			if (newFilename) {
				const newRelativePath = join(
					dirname(vttFile.relativePath),
					newFilename,
				);
				vttFiles[i] = {
					absolutePath: join(vttFileDir, newFilename),
					relativePath: newRelativePath,
					filename: newFilename,
				};
			} else {
				vttFiles[i] = { absolutePath: "", relativePath: "", filename: "" };
			}
		}
	}
	return vttFiles.filter((f) => f.absolutePath !== "");
}
