import { useSyncExternalStore } from "react";
import type { ClientFailure } from "../../../shared/ClientFailure";
import {
	getClientFailures,
	subscribeClientFailures,
} from "./recordClientFailure";

export function useClientFailures(): ClientFailure[] {
	return useSyncExternalStore(
		subscribeClientFailures,
		getClientFailures,
		getClientFailures,
	);
}
