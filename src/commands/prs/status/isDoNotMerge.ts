const DO_NOT_MERGE = /^\s*[[(]\s*(do[\s_-]*not\b[^\])]*|dnm)\s*[\])]/i;

export function isDoNotMerge(title: string): boolean {
	return DO_NOT_MERGE.test(title);
}
