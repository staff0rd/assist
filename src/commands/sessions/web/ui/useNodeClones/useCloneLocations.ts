import { useEffect, useState } from "react";
import {
	fetchLocations,
	type RepoLocation,
} from "./useCloneLocations/fetchLocations";

type Locations = { origin: string; byNode: Record<string, RepoLocation> };

export const NODE_SEPARATOR = "\0";

export function useCloneLocations(
	origin: string | undefined,
	missing: string,
): Locations | null {
	const [locations, setLocations] = useState<Locations | null>(null);

	useEffect(() => {
		if (!origin || !missing) return;
		let cancelled = false;
		fetchLocations(origin, missing.split(NODE_SEPARATOR)).then((entries) => {
			if (!cancelled)
				setLocations({ origin, byNode: Object.fromEntries(entries) });
		});
		return () => {
			cancelled = true;
		};
	}, [origin, missing]);

	return locations;
}
