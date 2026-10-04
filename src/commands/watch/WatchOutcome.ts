export type WatchOutcome =
	| {
			kind: "moved";
			upstream: string;
			from: string;
			to: string;
			count: number;
	  }
	| { kind: "timeout"; upstream: string; timeout: string }
	| { kind: "simulated-divergence"; upstream: string }
	| { kind: "unavailable"; reason: string }
	| { kind: "interrupted" };
