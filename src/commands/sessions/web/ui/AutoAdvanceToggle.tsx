import { CardToggle } from "./CardToggle";

export function AutoAdvanceToggle(props: {
	checked: boolean;
	onChange: (enabled: boolean) => void;
}) {
	return <CardToggle label="Continue" {...props} />;
}
