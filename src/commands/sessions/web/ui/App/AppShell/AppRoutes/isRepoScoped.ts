import type { SessionType } from "../../../../../shared/deriveHistoryFields";

const UNSCOPED: SessionType[] = ["update"];

export function isRepoScoped(type: SessionType | undefined): boolean {
	return !type || !UNSCOPED.includes(type);
}
