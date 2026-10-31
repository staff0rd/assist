import type { ClientFailure } from "../../../shared/ClientFailure";
import { queueClientFailureReport } from "./queueClientFailureReport";

const MAX_RECENT = 100;

let recent: ClientFailure[] = [];

export function recordClientFailure(failure: ClientFailure): void {
	recent = [failure, ...recent].slice(0, MAX_RECENT);
	queueClientFailureReport(failure);
}

export function getClientFailures(): ClientFailure[] {
	return recent;
}
