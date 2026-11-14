import type { SdkProcessInfo } from "../../../../../shared/harnessAdapters/types";

export function dedupeProcessEmit(
	emit: (process: SdkProcessInfo | null) => void,
): (process: SdkProcessInfo | null) => void {
	let published: string | undefined;
	return (info) => {
		const key = info ? JSON.stringify(info) : undefined;
		if (key === published) return;
		published = key;
		emit(info);
	};
}
