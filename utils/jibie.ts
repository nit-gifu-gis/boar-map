import { SERVER_URI } from "./gis";

export const calcDefaultID = (trader?: TraderInfo): string => {
  if (!trader) return "";

  // TODO: Generate ID with capture date.
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  const yy = `${`${date.getFullYear()}`.substring(2, 4)}`;
  return `${trader.code}1${yy}`;
};

export const filterListByArea = (
  list?: TraderList,
  area?: string
): TraderInfo[] => {
  if (!list) return [];

  const allList: TraderInfo[] = [];
  for (let i = 0; i < list.area.length; i++) {
    const t1 = list.area[i];
    const t2 = list.trader[t1];
    for (let j = 0; j < t2.length; j++) {
      const info = t2[j];
      info.area = t1;
      allList.push(info);
    }
  }

  // フィルターが指定されていない場合にはそのまま返す
  if (!area || area === " ") return allList;

  return allList.filter(info => info.area === area);
};

export const fetchTraderList = async (): Promise<TraderList> => {
  const inf = await fetch(SERVER_URI + "/v2/Jibie/List", {
    mode: "cors",
    credentials: "include"
  });
  const jsn = await inf.json();
  return jsn;
};

export const getTraderByName = async (
  name: string,
  area?: string
): Promise<TraderInfo | null> => {
  const list = await fetchTraderList();
  if (
    area != undefined &&
    area != null &&
    !area &&
    area !== " " &&
    !list.area.includes(area)
  )
    return null;

  if (area == null || area === " " || area === "") {
    for (let i = 0; i < list.area.length; i++) {
      const traders = list.trader[list.area[i]];
      for (let j = 0; j < traders.length; j++) {
        const trader = traders[j];
        if (trader.name === name) {
          trader.area = list.area[i];
          return trader;
        }
      }
    }
  } else {
    const traders = list.trader[area];
    for (let i = 0; i < traders.length; i++) {
      const trader = traders[i];
      if (trader.name === name) {
        trader.area = area;
        return trader;
      }
    }
  }
  return null;
};

export const hasTrader = async (
  boars: Record<string, unknown>[]
): Promise<boolean> => {
  const myInfo = await fetchTraderInfo();
  // TODO: アカウントと業者の関連付けが完了したらfalseにする。
  if (!myInfo) return true;

  for (let i = 0; i < boars.length; i++) {
    if (boars[i]["処分方法"] === "利活用（ジビエ利用）" || boars[i]["処分方法"] === "ジビエ業者渡し") {
      if (
        boars[i]["地域"] === myInfo.area &&
        boars[i]["ジビエ業者"] === myInfo.info.name
      )
        return true;
    }
  }
  return false;
};

export const fetchTraderInfo = async (): Promise<MyTraderInfo> => {
  const inf = await fetch(SERVER_URI + "/v2/Jibie/Me", {
    mode: "cors",
    credentials: "include"
  });

  const jsn = (await inf.json()) as MyTraderInfo;
  if (jsn.area && jsn.info) jsn.info.area = jsn.area;

  return jsn;
};

export const includeTrader = (
  list: TraderInfo[],
  value: TraderInfo
): boolean => {
  if (value === null || value === undefined) return false;

  for (let i = 0; i < list.length; i++) {
    const v = list[i];
    if (v.code == value.code && v.name == v.name) {
      return true;
    }
  }
  return false;
};

export const checkLuhn = (value: string): boolean => {
  if (value.length < 0) return false;
  return calcLuhn(value.slice(0, -1)) === parseInt(value.slice(-1));
};

const calcLuhn = (value: string): number => {
  const digits = value.split("");
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = parseInt(digits[digits.length - 1 - i]);
    if (i % 2 == 0) {
      const v = d * 2;
      const d2 = `${v}`.split("");
      d2.forEach(d2_ => {
        sum = sum + parseInt(d2_);
      });
    } else {
      sum = sum + d;
    }
  }
  return (10 - (sum % 10)) % 10;
};

export interface TraderList {
  area: string[];
  trader: Record<string, TraderInfo[]>;
}

export interface MyTraderInfo {
  area?: string;
  info?: TraderInfo;
}

export interface TraderInfo {
  area?: string;
  name: string;
  code: string;
}
