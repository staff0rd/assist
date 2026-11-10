const WHEEL_REPORTING_MODES = new Set([1000, 1002, 1003]);
const SGR_MODE = 1006;

export type MouseModes = {
	update: (params: (number | number[])[], on: boolean) => void;
	clear: () => void;
	reportsWheel: () => boolean;
	sgr: () => boolean;
};

export function createMouseModes(): MouseModes {
	const wheelModes = new Set<number>();
	let sgr = false;
	return {
		update: (params, on) => {
			for (const param of params) {
				if (typeof param !== "number") continue;
				if (WHEEL_REPORTING_MODES.has(param)) {
					if (on) wheelModes.add(param);
					else wheelModes.delete(param);
				}
				if (param === SGR_MODE) sgr = on;
			}
		},
		clear: () => {
			wheelModes.clear();
			sgr = false;
		},
		reportsWheel: () => wheelModes.size > 0,
		sgr: () => sgr,
	};
}
