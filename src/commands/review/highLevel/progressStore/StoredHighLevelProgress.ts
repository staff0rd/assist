import type {
	PreviewChecklistItem,
	PreviewReviewComment,
} from "../../../sessions/shared/PreviewDecision";

type StoredHighLevelItem = PreviewChecklistItem & { headSha: string };

type StoredHighLevelComment = PreviewReviewComment & { headSha: string };

export type StoredHighLevelProgress = {
	repo: string;
	prNumber: number;
	updatedAt: string;
	closedRequests?: string[];
	items: StoredHighLevelItem[];
	reviewComments: StoredHighLevelComment[];
};

export type HighLevelProgressHead = {
	repo: string;
	prNumber: number;
	headSha: string;
	requestId?: string;
};

type HighLevelPaneItem = Omit<PreviewChecklistItem, "ticked"> & {
	ticked?: boolean;
};

export type HighLevelPaneProgress = {
	updatedAt?: string;
	items: HighLevelPaneItem[];
	reviewComments?: PreviewReviewComment[];
};
