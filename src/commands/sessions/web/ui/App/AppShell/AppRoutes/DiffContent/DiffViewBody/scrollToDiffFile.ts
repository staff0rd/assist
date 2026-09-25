import { diffFileDomId } from "../diffFileDomId";

export function scrollToDiffFile(fileKey: string): void {
	document
		.getElementById(diffFileDomId(fileKey))
		?.scrollIntoView({ behavior: "smooth", block: "start" });
}
