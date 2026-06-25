const MAX_COMMENT_LENGTH = 50;

type CommentValidation =
	| { ok: true; text: string }
	| { ok: false; reason: string };

/**
 * Validates an escape-hatch comment body. Accepts only a single line of plain
 * comment text; rejects block-comment syntax and bodies over the length cap.
 */
export function validateCommentText(raw: string): CommentValidation {
	const text = raw.replace(/^\/\/\s?/, "");

	if (/[\r\n]/.test(text)) {
		return {
			ok: false,
			reason:
				"Comment must be a single line — multi-line comments are not allowed.",
		};
	}

	if (text.includes("/*") || text.includes("*/")) {
		return {
			ok: false,
			reason:
				"Block comments (/* */) are not allowed — only single-line // comments.",
		};
	}

	if (text.length > MAX_COMMENT_LENGTH) {
		return {
			ok: false,
			reason: `Comment text is ${text.length} chars; the cap is ${MAX_COMMENT_LENGTH}. Make it shorter or, better, make the code self-documenting.`,
		};
	}

	return { ok: true, text };
}
