export type RscRows = Record<string, unknown>;
export type RscResolve = (ref: string) => unknown;

export const isRscRef = (v: unknown): boolean =>
	typeof v === "string" && /^\$[0-9a-fL@]/.test(v);

/**
 * Parse a React Server Components "flight" response into its rows. Each line is
 * `<hexid>:<payload>`, where the payload is JSON optionally prefixed by a single
 * type marker character (e.g. `I`, `H`) that is not valid JSON.
 */
export function parseRscRows(flight: string): RscRows {
	const rows: RscRows = {};
	for (const line of flight.split("\n")) {
		const m = line.match(/^([0-9a-f]+):(.*)$/s);
		if (!m) continue;
		let payload = m[2];
		if (payload && !/^[[{"\d\-tfn]/.test(payload[0]))
			payload = payload.slice(1);
		try {
			rows[m[1]] = JSON.parse(payload);
		} catch {
			rows[m[1]] = m[2];
		}
	}
	return rows;
}

/**
 * Resolve a flight reference like `$88:0:1:props:children` to the value it points
 * at: row `88`, then walk the `:`-separated path. Lazy markers `L`/`@` are
 * stripped. Returns undefined if any step is missing.
 */
export function makeRscResolver(rows: RscRows): RscResolve {
	return (ref) => {
		const [id, ...path] = ref.slice(1).replace(/^[L@]/, "").split(":");
		let v: unknown = rows[id];
		for (const key of path) {
			if (v == null || typeof v !== "object") return undefined;
			v = (v as Record<string, unknown>)[key];
		}
		return v;
	};
}
