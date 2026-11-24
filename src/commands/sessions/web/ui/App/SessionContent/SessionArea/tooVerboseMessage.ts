import { formatBlockquoteComment } from "../../formatBlockquoteComment";
import { tooVerboseExcerpt } from "./tooVerboseExcerpt";
import { tooVerbosePrompt } from "./tooVerbosePrompt";

export function tooVerboseMessage(text: string, isLast: boolean): string {
	if (isLast) return tooVerbosePrompt;
	return formatBlockquoteComment(tooVerboseExcerpt(text), tooVerbosePrompt);
}
