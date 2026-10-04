type VersionDrift = "behind" | "ahead";

function releaseParts(version: string): number[] {
	return version.split("-")[0].split(".").map(Number);
}

export function peerVersionDrift(
	peer: string | undefined,
	local: string | undefined,
): VersionDrift | undefined {
	if (!peer || !local || peer === local) return undefined;
	const a = releaseParts(peer);
	const b = releaseParts(local);
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const diff = (a[i] ?? 0) - (b[i] ?? 0);
		if (Number.isNaN(diff)) return undefined;
		if (diff !== 0) return diff < 0 ? "behind" : "ahead";
	}
	return undefined;
}
