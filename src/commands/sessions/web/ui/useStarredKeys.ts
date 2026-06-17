import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toggleStar as toggleStarApi } from "../../../backlog/web/ui/api";
import { loadStarredKeys } from "./loadStarredKeys";
import { sessionStarTarget, starTargetKey } from "./sessionStarTarget";
import type { SessionInfo } from "./types";

type SetKeys = Dispatch<SetStateAction<Set<string>>>;

function withKey(keys: Set<string>, key: string, on: boolean): Set<string> {
	const next = new Set(keys);
	if (on) next.add(key);
	else next.delete(key);
	return next;
}

export function checkStarred(
	starred: Set<string>,
	session: SessionInfo,
): boolean {
	const target = sessionStarTarget(session);
	return target ? starred.has(starTargetKey(target.cwd, target.itemId)) : false;
}

export function applyToggle(setStarred: SetKeys, session: SessionInfo): void {
	const target = sessionStarTarget(session);
	if (!target) return;
	const key = starTargetKey(target.cwd, target.itemId);
	setStarred((prev) => {
		const on = !prev.has(key);
		void toggleStarApi(target.itemId, on, target.cwd);
		return withKey(prev, key, on);
	});
}

function subscribeStarredKeys(cwdsKey: string, setKeys: SetKeys): () => void {
	let cancelled = false;
	const cwds = cwdsKey ? cwdsKey.split("|") : [];
	loadStarredKeys(cwds).then((loaded) => {
		if (!cancelled) setKeys(loaded);
	});
	return () => {
		cancelled = true;
	};
}

/** Starred-item keys for the given repos, refetched when the repo set changes. */
export function useStarredKeys(cwdsKey: string) {
	const [keys, setKeys] = useState<Set<string>>(new Set());
	useEffect(() => subscribeStarredKeys(cwdsKey, setKeys), [cwdsKey]);
	return [keys, setKeys] as const;
}
