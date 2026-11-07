import { sendTo } from "../broadcast";
import { routed } from "../routed";
import { autoUpdateReply } from "./autoUpdateReply";

export const handleAutoUpdate = routed((client, _m, d) =>
	sendTo(client, autoUpdateReply(d.requestId)),
);
