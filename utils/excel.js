import ExcelJS from "exceljs";

const ERROR_MESSAGE =
  "Excelファイルの形式が間違っています。ファイルをご確認ください。";

export const loadNameList = file => {
  return new Promise(async (resolve, reject) => {
    const nameListWorkbook = new ExcelJS.Workbook();
    await nameListWorkbook.xlsx.load(file);
    const worksheet = nameListWorkbook.getWorksheet("ユーザー一覧");
    // シートが無い
    if (worksheet == null) {
      reject(ERROR_MESSAGE);
      return;
    }

    const values = worksheet.getSheetValues();
    // 1番目の列がヘッダー，確認する
    if (values[1][2] !== "ユーザーID" || values[1][3] !== "氏名") {
      reject(ERROR_MESSAGE);
      return;
    }

    // 形式があっているなら抽出
    const nameList = values
      .filter((v, i) => (i !== 0) | 1)
      .map(row => {
        return {
          userId: row[2],
          name: row[3]
        };
      });
    resolve(nameList);
    return;
  });
};

export const downloadExcel = (features, nameList, images) => {
  const makeRow = feature => {
    const properties = feature.properties;
    // 名前は対応するものが一覧にあればそっちを採用する
    const nameData = nameList.find(
      elem => elem.userId === properties["入力者"]
    );
    const name = nameData != undefined ? nameData.name : properties["入力者"];
    // 市町村はメッシュ番号から切り出す
    const cityPattern = /(^\D+)\d-?\d/;
    const cityResult = cityPattern.exec(properties["メッシュ番号"]);
    const city = cityResult != null ? cityResult[1] : "";
    // 捕獲年月日からは時刻を削除
    const datePattern = /(^[\d/-]+)\s.*/;
    const dateResult = datePattern.exec(properties["捕獲年月日"]);
    const date = dateResult != null ? dateResult[1] : "";
    // 行を返す
    return [
      properties["ID$"],
      name,
      city,
      properties["区分"],
      date,
      properties["罠・発見場所"],
      properties["捕獲頭数"],
      properties["幼獣の頭数"],
      properties["成獣の頭数"],
      properties["幼獣・成獣"],
      properties["性別"],
      properties["妊娠の状況"],
      properties["体長"],
      properties["処分方法"],
      properties["備考"],
      properties["画像ID"]
    ];
  };

  return new Promise(async (resolve, reject) => {
    // ワークブック作成
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("捕獲いのしし一覧表");

    // todo: 整形
    // ヘッダ挿入
    const headers = [
      "ID",
      "入力者",
      "市町村",
      "区分",
      "捕獲年月日",
      "わなの種類\n発見場所",
      "捕獲頭数",
      "幼獣の頭数",
      "成獣の頭数",
      "幼獣・成獣",
      "性別",
      "妊娠の状況",
      "体長",
      "処分方法",
      "備考",
      "画像"
    ];
    sheet.addRow(headers);

    // データ挿入
    const rows = features.map(f => makeRow(f));
    console.log(rows);
    sheet.addRows(rows);
    console.log(sheet.getSheetValues());

    // bufferに書き込む
    const buffer = workbook.xlsx.writeBuffer();
    resolve(buffer);
  });
};
