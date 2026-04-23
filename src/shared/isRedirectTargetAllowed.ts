/** Check whether a redirect target is under the given temp directory, handling Unix and Windows path styles. */
export function isRedirectTargetAllowed(target: string, tmp: string): boolean {
	if (/^[A-Za-z]:[\\/]/.test(tmp)) return isUnderWindowsTmp(target, tmp);
	return isUnderPosixTmp(target, tmp);
}

function isUnderWindowsTmp(target: string, tmp: string): boolean {
	if (!/^[A-Za-z]:[\\/]/.test(target)) return false;
	const nTmp = normalizeWindowsPath(tmp);
	const nTarget = normalizeWindowsPath(target);
	return nTarget === nTmp || nTarget.startsWith(`${nTmp}\\`);
}

function normalizeWindowsPath(p: string): string {
	return p.replace(/\//g, "\\").toLowerCase().replace(/\\+$/, "");
}

function isUnderPosixTmp(target: string, tmp: string): boolean {
	if (!target.startsWith("/")) return false;
	const nTmp = tmp.replace(/\/+$/, "");
	return target === nTmp || target.startsWith(`${nTmp}/`);
}
