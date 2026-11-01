import { phoneContextOptions } from "./phoneContextOptions";
import { phoneInsets } from "./phoneInsets";

const PHONE_STATUS_BAR_HEIGHT = phoneInsets.statusBar;
const PHONE_HOME_INDICATOR_HEIGHT = phoneInsets.homeIndicator;

const BATTERY_SVG = `<svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity="0.4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/><rect x="25" y="4.5" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4"/></svg>`;
const SIGNAL_SVG = `<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>`;

export function phoneFrameHtml(
	screenshotBase64: string,
	background: string,
	theme: "light" | "dark",
): string {
	const fg = theme === "dark" ? "#fff" : "#000";
	const { width } = phoneContextOptions.viewport;
	return `<!doctype html><html><body style="margin:0;background:transparent">
<div id="phone" style="display:inline-block;padding:13px;background:#1b1b1d;border-radius:64px;box-shadow:inset 0 0 0 2px #3a3a3c">
<div style="position:relative;width:${width}px;border-radius:51px;overflow:hidden;background:${background};padding:${PHONE_STATUS_BAR_HEIGHT}px 0 ${PHONE_HOME_INDICATOR_HEIGHT}px;color:${fg};font-family:-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif">
<div style="position:absolute;inset:0 0 auto;height:${PHONE_STATUS_BAR_HEIGHT}px;display:flex;align-items:center;justify-content:space-between;padding:4px 30px 0 46px;box-sizing:border-box;font-weight:600;font-size:17px">
<span>9:41</span><span style="display:flex;gap:6px;align-items:center">${SIGNAL_SVG}${BATTERY_SVG}</span></div>
<div style="position:absolute;top:11px;left:50%;transform:translateX(-50%);width:125px;height:36px;border-radius:18px;background:#000"></div>
<img src="data:image/png;base64,${screenshotBase64}" style="display:block;width:${width}px">
<div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;border-radius:3px;background:${fg}"></div>
</div></div></body></html>`;
}
