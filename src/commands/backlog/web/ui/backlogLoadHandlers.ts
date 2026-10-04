import type { Dispatch, SetStateAction } from "react";
import { itemsEqual } from "./itemsEqual";
import type { BacklogLoadHandlers } from "./revalidateBacklog";
import type { BacklogItemSummary } from "./types";

type Setters = {
	setItems: Dispatch<SetStateAction<BacklogItemSummary[]>>;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
};

export function backlogLoadHandlers({
	setItems,
	setLoading,
	setError,
}: Setters): BacklogLoadHandlers {
	return {
		onLoaded: (next) => {
			setItems((prev) => (itemsEqual(prev, next) ? prev : next));
			setLoading(false);
			setError(null);
		},
		onError: (message) => {
			setLoading(false);
			setError(message);
		},
	};
}
