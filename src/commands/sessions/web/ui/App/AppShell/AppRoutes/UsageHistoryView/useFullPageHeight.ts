import { useLayoutEffect, useRef, useState } from "react";

export function useFullPageHeight(rowCount: number, pageSize: number) {
	const ref = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number>();

	useLayoutEffect(() => {
		if (rowCount === pageSize && ref.current) {
			setHeight(ref.current.offsetHeight);
		}
	}, [rowCount, pageSize]);

	return { ref, height };
}
