import type { ToolInputField } from "../../../../../../../../../../shared/harnessAdapters/types";
import { isUrlTarget } from "./isUrlTarget";

export function artifactRowLink(
	fields: ToolInputField[],
	resultUrl?: string,
): string | undefined {
	if (resultUrl) return resultUrl;
	const url = fields.find((f) => f.name === "url")?.value.trim();
	return url && isUrlTarget(url) ? url : undefined;
}
