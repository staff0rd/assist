const PROXY_UNREACHABLE = new Set([502, 504]);

export type ProxyBlipGate = {
	shouldRecord: (status: number) => boolean;
	reset: () => void;
};

export function createProxyBlipGate(): ProxyBlipGate {
	let held = false;
	return {
		shouldRecord: (status) => {
			if (!PROXY_UNREACHABLE.has(status)) {
				held = false;
				return true;
			}
			if (held) return true;
			held = true;
			return false;
		},
		reset: () => {
			held = false;
		},
	};
}
