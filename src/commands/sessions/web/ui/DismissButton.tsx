import {
	cardActionButtonStyle,
	cardActionHover,
} from "./cardActionButtonStyle";

export function DismissButton({ onDismiss }: { onDismiss: () => void }) {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onDismiss();
			}}
			onMouseEnter={(e) => cardActionHover(e, true)}
			onMouseLeave={(e) => cardActionHover(e, false)}
			style={{ ...cardActionButtonStyle, fontSize: 16 }}
			title="Dismiss"
		>
			×
		</button>
	);
}
