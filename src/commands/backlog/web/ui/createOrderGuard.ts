export type OrderGuard = {
	hold: () => () => void;
	ticket: () => () => boolean;
};

export function createOrderGuard(): OrderGuard {
	let pending = 0;
	let epoch = 0;
	return {
		hold() {
			pending++;
			epoch++;
			let released = false;
			return () => {
				if (released) return;
				released = true;
				pending--;
				epoch++;
			};
		},
		ticket() {
			const start = epoch;
			return () => pending === 0 && epoch === start;
		},
	};
}
