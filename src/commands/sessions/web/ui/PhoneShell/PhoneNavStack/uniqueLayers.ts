import type { Location } from "react-router";

export function uniqueLayers(layers: (Location | undefined)[]): Location[] {
	return layers.filter(
		(l, i): l is Location =>
			l !== undefined && layers.findIndex((o) => o?.key === l.key) === i,
	);
}
