import { useCallback, useEffect, useState } from "react";
import type { PrPreview } from "../../shared/SessionInfoBase";

export function useRetainedPreview(preview: PrPreview | null) {
	const [rendered, setRendered] = useState<PrPreview | null>(preview);

	useEffect(() => {
		if (preview) setRendered(preview);
	}, [preview]);

	const onExited = useCallback(() => setRendered(null), []);

	return { rendered, onExited };
}
