import { useEffect, useRef, useState } from "react";

const confirmMs = 1200;

export function useCopyFeedback(text: string): {
	copied: boolean;
	copy: () => void;
} {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	const copy = () => {
		void navigator.clipboard?.writeText(text).then(() => {
			setCopied(true);
			clearTimeout(timer.current);
			timer.current = setTimeout(() => setCopied(false), confirmMs);
		});
	};

	return { copied, copy };
}
