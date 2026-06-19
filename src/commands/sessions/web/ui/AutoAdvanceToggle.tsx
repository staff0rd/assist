import { CardToggle } from "./CardToggle";

export function AutoAdvanceToggle({
	label = "Continue",
	...props
}: {
	checked: boolean;
	onChange: (enabled: boolean) => void;
	label?: string;
}) {
	return <CardToggle label={label} {...props} />;
}
