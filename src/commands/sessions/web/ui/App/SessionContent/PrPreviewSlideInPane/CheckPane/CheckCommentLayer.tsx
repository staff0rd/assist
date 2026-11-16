import type { ReactNode } from "react";
import type { AskCheckInput } from "../../../../../../shared/askCheckInputSchema";
import { QuestionCommentLayer } from "../../../QuestionCommentLayer";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { checkCommentFrom } from "./CheckCommentLayer/checkCommentFrom";

export function CheckCommentLayer({
	check,
	comments,
	children,
}: {
	check: AskCheckInput;
	comments: HighLevelDiffComments;
	children: ReactNode;
}) {
	return (
		<QuestionCommentLayer
			path="Manual check"
			comments={comments}
			build={(quote, note) => checkCommentFrom(check, quote, note)}
		>
			{children}
		</QuestionCommentLayer>
	);
}
