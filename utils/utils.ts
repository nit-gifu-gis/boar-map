// 汎用的な関数たち

/** Utility function to create a K:V from a list of strings */
export function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}

/** デバイスとブラウザ */
export type Device =
  | "iphone"
  | "ipad"
  | "android_mobile"
  | "android_tablet"
  | "mac"
  | "windows_pc"
  | "other";

export type Browser =
  | "ie"
  | "edge"
  | "chrome"
  | "firefox"
  | "safari"
  | "other";

export const getDevice = (): Device => {
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.indexOf("windows nt") !== -1) return "windows_pc";
  if (ua.indexOf("iphone") !== -1) return "iphone";
  if (ua.indexOf("ipad") !== -1 || (ua.indexOf("mac") !== -1 && 'ontouchend' in document)) return "ipad";
  if (ua.indexOf("mac os") !== -1) return "mac";
  if (ua.indexOf("android") !== -1) {
    if (ua.indexOf("mobile")) return "android_mobile";
    else return "android_tablet";
  }
  return "other";
}

export const getBrowser = (): Browser => {
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.indexOf("msie") !== -1 || ua.indexOf("trident") !== -1) return "ie";
  if (ua.indexOf("edge") !== -1) return "edge";
  if (ua.indexOf("chrome") !== -1 || ua.indexOf("crios") !== -1) return "chrome";
  if (ua.indexOf("firefox") !== -1 || ua.indexOf("fxios") !== -1) return "firefox";
  if (ua.indexOf("safari") !== -1) return "safari";
  return "other";
}
