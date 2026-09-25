import Box from "@mui/material/Box";
import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { ConfigNodeValue } from "./ConfigValue/ConfigNodeValue";
import { ConfigScalarText } from "./ConfigScalarText";
import { effectiveConfigValue } from "./effectiveConfigValue";
import { EmptyConfigValue } from "./EmptyConfigValue";

export function ConfigValue({ entry }: { entry: ConfigEntry }) {
	const value = effectiveConfigValue(entry);
	if (value === undefined) return <EmptyConfigValue text="not set" />;

	return (
		<Box
			sx={{
				color: entry.source === "default" ? "text.secondary" : "text.primary",
			}}
		>
			{entry.node ? (
				<ConfigNodeValue node={entry.node} value={value} />
			) : (
				<ConfigScalarText value={value} />
			)}
		</Box>
	);
}
