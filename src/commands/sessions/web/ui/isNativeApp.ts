import { Capacitor } from "@capacitor/core";
import { hasPhoneCaptureFlag } from "./hasPhoneCaptureFlag";

export const isNativePlatform = Capacitor.isNativePlatform();

export const isNativeApp = isNativePlatform || hasPhoneCaptureFlag();
