import { useCallback, useState } from "react";
import type { ExtraNotices } from "./pageNotices";

const noError = () => {};

export function useLinkedNotice(): ExtraNotices & {
	show: (message: string) => void;
} {
	const [back, setBack] = useState<string | null>(null);
	return {
		back,
		show: setBack,
		clearBack: useCallback(() => setBack(null), []),
		error: null,
		clearError: noError,
	};
}
