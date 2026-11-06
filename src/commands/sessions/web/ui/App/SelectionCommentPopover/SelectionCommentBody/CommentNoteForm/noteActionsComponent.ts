import { CommentNoteActions } from "./CommentNoteActions";
import { CommentNoteStackedActions } from "./CommentNoteStackedActions";

export function noteActionsComponent(stacked: boolean | undefined) {
	return stacked ? CommentNoteStackedActions : CommentNoteActions;
}
