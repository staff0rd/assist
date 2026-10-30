import { assistVersion } from "../../App/AppShell/assistVersion";
import { PhoneValueGroup } from "./PhoneValueGroup";

const shown = (version: string | undefined) => (version ? `v${version}` : "—");

export function PhoneVersions({
	homeName,
	homeVersion,
}: {
	homeName: string;
	homeVersion: string | undefined;
}) {
	return (
		<PhoneValueGroup
			title="Version"
			rows={[
				{ key: "app", label: "App", value: shown(assistVersion) },
				{ key: "home", label: homeName, value: shown(homeVersion) },
			]}
		/>
	);
}
