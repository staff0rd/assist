import type { UpdateActions } from "../nodeUpdates/useUpdateActions";

export type ExtraNotices = {
	back: string | null;
	clearBack: () => void;
	error: string | null;
	clearError: () => void;
};

export function pageNotices(actions: UpdateActions, extras: ExtraNotices[]) {
	const { notices, localError, clearLocalError } = actions;
	const firstOf = (key: "back" | "error") =>
		extras.find((extra) => extra[key])?.[key] ?? null;
	return {
		back: firstOf("back") ?? notices.back,
		clearBack: () => {
			notices.clearBack();
			for (const extra of extras) extra.clearBack();
		},
		error: firstOf("error") ?? notices.error ?? localError,
		clearError: () => {
			notices.clearError();
			clearLocalError();
			for (const extra of extras) extra.clearError();
		},
	};
}
