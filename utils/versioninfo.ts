// バージョン情報周りの情報取得
export type VersionInfomation = {
  latestNumber: string;
  allText: string;
}

// バージョン情報を取得する関数
export const getVersionInfomation = (): Promise<VersionInfomation> => {
  return new Promise<VersionInfomation>((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open("GET", "static/history.md", false);
    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        if (req.status === 200 || req.status === 0) {
          const allText = req.responseText;
          // 最新のバージョン番号を取得する
          const pattern = /^### .+$/m;
          const result = allText.match(pattern);
          const latest = result[0].replace("### ", "");
          resolve({
            allText: allText,
            latestNumber: latest
          });
        } else {
          reject("file open error");
        }
      } else {
        reject(`file open error, status code = ${req.status}`);
      }
    }
    req.onerror = () => {
      reject("file open error");
    }
    req.send();
  });
};