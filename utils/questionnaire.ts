// アンケートフォーム周り

import { getUserData } from './gis';
import { Device, Browser, getBrowser, getDevice } from './utils';

const FORM_URL_BASE = "https://docs.google.com/forms/d/e/1FAIpQLSclRLGXGQVWDFh7T1eWQD83R35eeFs9hUKB5-0KxGYSx-qZcA/viewform?usp=pp_url";
const USER_ID_PREFIX = "&entry.632601331=";
const DEVICE_PREFIX = "&entry.345321002=";
const BROWSER_PREFIX = "&entry.343469124=";

// google formの回答とtypescriptのリテラル型の対応づけ
const DEVICE_ANSWER: { [device in Device]: string } = {
  android_mobile: "Android スマートフォン",
  android_tablet: "Android タブレット",
  ipad: "iPad",
  iphone: "iPhone",
  mac: "Mac",
  windows_pc: "Windows PC",
  other: ""
};

const BROWSER_ANSWER: { [browser in Browser]: string } = {
  chrome: "Google Chrome",
  edge: "Microsoft Edge",
  firefox: "Firefox",
  ie: "Internet Explorer",
  safari: "Safari",
  other: ""
};

export const getFormUrl = () => {
  const userData = getUserData();
  const userId = (userData) ? userData.userId : "";
  const device = DEVICE_ANSWER[getDevice()];
  const browser = BROWSER_ANSWER[getBrowser()];

  return FORM_URL_BASE + USER_ID_PREFIX + userId + DEVICE_PREFIX + device + BROWSER_PREFIX + browser;
}