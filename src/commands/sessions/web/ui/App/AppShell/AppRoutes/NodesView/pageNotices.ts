import type { UpdateActions } from "../nodeUpdates/useUpdateActions";

type RemovalNotices = {
	back: string | null;
	clearBack: () => void;
	error: string | null;
	clearError: () => void;
};

export function pageNotices(actions: UpdateActions, removal: RemovalNotices) {
	const { notices, localError, clearLocalError } = actions;
	return {
		back: removal.back ?? notices.back,
		clearBack: () => {
			notices.clearBack();
			removal.clearBack();
		},
		error: removal.error ?? notices.error ?? localError,
		clearError: () => {
			notices.clearError();
			clearLocalError();
			removal.clearError();
		},
	};
}
