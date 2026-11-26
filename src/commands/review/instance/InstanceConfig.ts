import type { AssistConfig } from "../../../shared/types";

type ConfiguredInstance = NonNullable<
	NonNullable<AssistConfig["review"]>["instance"]
>;

export type InstanceConfig = ConfiguredInstance & {
	composeFile: string;
	entry: { service: string; path: string };
};

export type InstanceServices = InstanceConfig["services"];
