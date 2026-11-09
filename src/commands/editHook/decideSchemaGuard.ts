import type {
	ExecutionIdentity,
	ToolOperation,
} from "../../shared/harnessAdapters/types";
import { isSchemaLocked } from "../schema/isSchemaLocked";
import { isSchemaPath, SCHEMA_LOCK_REASON } from "../schema/isSchemaPath";

export async function decideSchemaGuard(
	{ path, contents }: Extract<ToolOperation, { kind: "fileWrite" }>,
	identity?: ExecutionIdentity,
): Promise<string | undefined> {
	if (!isSchemaPath(path, contents)) return undefined;
	return (await isSchemaLocked(identity)) ? SCHEMA_LOCK_REASON : undefined;
}
