import { useState } from "react";

export function useProposal() {
	const [error, setError] = useState<string>();
	const [sending, setSending] = useState(false);
	const run = async (send: () => Promise<string | undefined>) => {
		setSending(true);
		const failure = await send();
		setSending(false);
		setError(failure);
	};
	return { error, sending, run };
}
