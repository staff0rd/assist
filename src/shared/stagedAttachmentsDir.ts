import { homedir } from "node:os";
import { join } from "node:path";

export const stagedAttachmentsDir = join(homedir(), ".assist", "attachments");
