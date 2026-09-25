import type { SelectionAnchor } from "./SelectionCommentPopover";

export type PendingComment = SelectionAnchor & {
	start: number;
	end: number;
};
