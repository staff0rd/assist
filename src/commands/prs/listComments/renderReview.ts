import type { ReviewComment } from "../types";
import type { Style } from "./commentStyle";

export function renderReview(comment: ReviewComment, style: Style): string {
	return [
		`${style.cyan("Review")} by ${style.bold(comment.user)} ${style.state(comment.state)} ${style.dim(`id ${comment.id}`)} ${style.dim(comment.html_url)}`,
		comment.body,
		"",
	].join("\n");
}
