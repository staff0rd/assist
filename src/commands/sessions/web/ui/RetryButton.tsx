import {
	cardActionButtonStyle,
	cardActionHover,
} from "./cardActionButtonStyle";

export function RetryButton({ onRetry }: { onRetry: () => void }) {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onRetry();
			}}
			onMouseEnter={(e) => cardActionHover(e, true)}
			onMouseLeave={(e) => cardActionHover(e, false)}
			style={{ ...cardActionButtonStyle, fontSize: 14 }}
			title="Retry"
		>
			↻
		</button>
	);
}
