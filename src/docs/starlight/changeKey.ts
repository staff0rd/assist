import { hashText } from "./hashText";

export function changeKey(pageId: string, change: Element[]): string {
	return `${pageId}#${hashText(change.map((element) => element.outerHTML).join("\n"))}`;
}
