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

export const downloadExcel = async tableData => {
  const convertBase64 = imageData => {
    return new Promise(resolve => {
      const img = new Image();
      img.src = imageData.src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = imageData.w;
        canvas.height = imageData.h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        resolve(dataUrl);
      };
    });
  };

  const makeRow = async (data, workbook, sheet) => {
    // テキストデータを入れる
    const row = [
      data["ID"],
      data["入力者"],
      data["市町村"],
      data["区分"],
      data["捕獲年月日"],
      data["罠・発見場所"],
      data["捕獲頭数"],
      data["幼獣の頭数"],
      data["成獣の頭数"],
      data["幼獣・成獣"],
      data["性別"],
      data["妊娠の状況"],
      data["体長"],
      data["処分方法"],
      data["備考"]
    ];
    sheet.addRow(row);

    // 画像データを入れる
    data["画像"].forEach(async d => {
      const base64 = await convertBase64(d);
      const imageIdForWorkbook = workbook.addImage({
        base64: base64,
        extension: "jpeg"
      });
      sheet.addImage(imageIdForWorkbook, {
        tl: { col: 20, row: 20 },
        ext: { width: d.w, height: d.h }
      });
    });
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
    tableData.forEach(async d => {
      await makeRow(d, workbook, sheet);
    });

    // bufferに書き込む
    const buffer = workbook.xlsx.writeBuffer();
    resolve(buffer);
  });
};
