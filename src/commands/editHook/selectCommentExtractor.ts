import { isCsharpFile } from "../../shared/isCsharpFile";
import { isHashCommentFile, isShellFile } from "../../shared/isHashCommentFile";
import { isRazorFile } from "../../shared/isRazorFile";
import { isRustFile } from "../../shared/isRustFile";
import { extractComments, isSourceFile } from "./extractComments";
import { extractCsharpCommentTexts } from "./extractCsharpCommentTexts";
import { extractRazorCommentTexts } from "./extractRazorCommentTexts";
import { extractRustCommentTexts } from "./extractRustCommentTexts";
import { extractShellComments } from "./extractShellComments";
import { extractYamlComments } from "./extractYamlComments";

type CommentGate = {
	extract: (text: string) => string[];
	marker: string;
};

export function selectCommentExtractor(
	filePath: string | undefined,
): CommentGate | undefined {
	if (isHashCommentFile(filePath))
		return {
			extract: isShellFile(filePath)
				? extractShellComments
				: extractYamlComments,
			marker: "#",
		};
	if (isCsharpFile(filePath))
		return { extract: extractCsharpCommentTexts, marker: "//" };
	if (isRazorFile(filePath))
		return { extract: extractRazorCommentTexts, marker: "//" };
	if (isRustFile(filePath))
		return { extract: extractRustCommentTexts, marker: "//" };
	if (isSourceFile(filePath)) return { extract: extractComments, marker: "//" };
	return undefined;
}
