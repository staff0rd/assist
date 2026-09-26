import { extractRustComments } from "../../shared/extractRustComments";
import { commentTexts } from "./commentTexts";

export function extractRustCommentTexts(text: string): string[] {
	return commentTexts(extractRustComments(text));
}
