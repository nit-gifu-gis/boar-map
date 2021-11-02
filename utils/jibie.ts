export const fetchArea = (): string[] => {
  return [
    "岐阜",
    "西濃",
    "揖斐",
    "中濃",
    "郡上",
    "加茂",
    "東濃",
    "恵那",
    "下呂",
    "飛騨"
  ];
};

// TODO: どこかで事業所リストを取得するように変更する。
export const fetchTraders = async (key: string): Promise<string[]> => {
  const value = {
    岐阜: ["事業所A", "事業所B", "事業所C"],
    西濃: ["事業所D", "事業所E", "事業所F"],
    揖斐: ["事業所G", "事業所H", "事業所I"],
    中濃: ["事業所J", "事業所K", "事業所L"],
    郡上: ["事業所M", "事業所N", "事業所O"],
    加茂: ["事業所P", "事業所Q", "事業所R"],
    東濃: ["事業所S", "事業所T", "事業所U"],
    恵那: ["事業所V", "事業所W", "事業所X"],
    下呂: ["事業所Y", "事業所Z", "事業所1"],
    飛騨: ["事業所2", "事業所3", "事業所4"]
  };
  return value[key];
};

// TODO: どこかで事業者に対する固有番号を取得するように変更する。
export const fetchDefaultID = async (
  area: string,
  trader: string
): Promise<string> => {
  const value = {
    岐阜: { 事業所A: "AAA1", 事業所B: "BBB2", 事業所C: "CCC3" },
    西濃: { 事業所D: "DDD1", 事業所E: "EEE2", 事業所F: "FFF3" },
    揖斐: { 事業所G: "GGG1", 事業所H: "HHH2", 事業所I: "III3" },
    中濃: { 事業所J: "JJJ1", 事業所K: "KKK2", 事業所L: "LLL3" },
    郡上: { 事業所M: "MMM1", 事業所N: "NNN2", 事業所O: "OOO3" },
    加茂: { 事業所P: "PPP1", 事業所Q: "QQQ2", 事業所R: "RRR3" },
    東濃: { 事業所S: "SSS1", 事業所T: "TTT2", 事業所U: "UUU3" },
    恵那: { 事業所V: "VVV1", 事業所W: "WWW2", 事業所X: "XXX3" },
    下呂: { 事業所Y: "YYY1", 事業所Z: "ZZZ2", 事業所1: "ABC3" },
    飛騨: { 事業所2: "DEF1", 事業所3: "GHI2", 事業所4: "JLK3" }
  };

  const dateStr = new Date().toISOString().substring(2, 4);
  return value[area][trader] ? value[area][trader] + dateStr : "";
};
