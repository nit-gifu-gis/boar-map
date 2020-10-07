import "./list.scss";

import React from "react";
import Router from "next/router";
import Header from "../../organisms/header";
import UserData from "../../../utils/userData";
import SearchForm from "../../organisms/searchForm";
import ListTable from "../../organisms/listTable";
import "../../../utils/statics";
import "../../../utils/excel";
import { downloadExcel } from "../../../utils/excel";

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: UserData.getUserData(),
      searching: false,
      searched: false,
      tableData: [],
      sortKey: "ID",
      reversed: false
    };
    this.onClickSearch.bind(this);
  }

  componentDidMount() {
    // 権限がない人はアクセス不可
    const department = this.state.userData.department;
    if (department !== "K") {
      Router.push("./map");
    }
  }

  // 検索ボタンが押された時
  async onClickSearch(data) {
    // console.log("Search data", data);
    // 検索中という状態，名前一覧をセット
    this.setState({ searching: true, nameList: data.nameList });
    try {
      const features = await this.getFeatures(data);
      const tableData = await this.makeTableData(features, data.nameList);
      this.setState({
        searched: true,
        searching: false,
        tableData: tableData
      });
    } catch (error) {
      alert(`エラーが発生しました．\n${error}`);
      this.setState({ searching: false });
    }
  }

  getFeatures(data) {
    const token = this.state.userData.access_token;
    const receiptNumber = Math.floor(Math.random() * 100000);
    // 今はまだイノシシだけでいい
    const layerId = BOAR_LAYER_ID;

    const date1 = data.date1;
    const date2 = data.date2;
    const cities = data.cities;

    // console.log(date1, date2, cities);

    // 条件を作る
    const combination = []; // 0=and 1=or
    const fieldName = []; // フィールド名を入れていく
    const searchValue = []; // 値を入れていく
    const operators = []; // 0=等しい 1=以上 2=以下 3=超える 4=未満 5=等しくない 6=部分一致 7=前方一致 8=後方一致

    // date1より捕獲年月日が後
    combination.push(0);
    fieldName.push("捕獲年月日");
    searchValue.push(date1);
    operators.push(1);

    // date2より捕獲年月日が前
    combination.push(0);
    fieldName.push("捕獲年月日");
    searchValue.push(date2);
    operators.push(2);

    // citiesがメッシュ番号の中に含まれている
    let flag = true;
    for (const city of cities) {
      if (flag) {
        combination.push(0);
        flag = false;
      } else {
        combination.push(1);
      }
      fieldName.push("メッシュ番号");
      searchValue.push(city);
      operators.push(6);
    }

    // リクエストに必要なデータを作る
    const reqBody = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: layerId,
      srid: 4326,
      combination: combination,
      fieldName: fieldName,
      searchValue: searchValue,
      operators: operators
    };
    // console.log(reqBody);

    return new Promise(async (resolve, reject) => {
      // リクエストを送信
      const res = await fetch("/api/JsonService.asmx/GetFeaturesByAttribute", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Map-Api-Access-Token": token
        },
        body: JSON.stringify(reqBody)
      });
      // サーバーエラーなら落ちる
      if (!res.ok) {
        const text = await res.text();
        console.error("Error 500", text);
        reject(text);
        return;
      }
      const json = await res.json();
      if (json.commonHeader.resultInfomation !== "0") {
        reject(json.commonHeader.systemErrorReport);
        return;
      }
      if (json.data.features == null) {
        reject("features is not found");
        return;
      }
      resolve(json.data.features);
    });
  }

  // テーブル用にデータを整形する
  async makeTableData(features, nameList) {
    // 画像の縦横長さをフェッチする関数
    const fetchImage = imageId => {
      return new Promise(resolve => {
        if (imageId === "") {
          resolve();
          return;
        }
        const img = new Image();
        img.onload = () => {
          resolve({
            id: imageId,
            w: img.width,
            h: img.height,
            src: img.src
          });
          return;
        };
        img.src = `${IMAGE_SERVER_URI}/view.php?type=${"boar"}&id=${imageId}`;
      });
    };

    const makeRow = async feature => {
      const properties = feature.properties;
      // 名前に対応するものがあればそっちを一覧表に採用
      const nameData = nameList.find(
        elem => elem.userId === properties["入力者"]
      );
      const name = nameData != undefined ? nameData.name : properties["入力者"];
      // 市町村はメッシュ番号から切り出し
      const cityPattern = /(^\D+)\d-?\d/;
      const cityResult = cityPattern.exec(properties["メッシュ番号"]);
      const city = cityResult != null ? cityResult[1] : "";
      // 捕獲年月日からは時刻を削除
      const datePattern = /(^[\d/-]+)\s.*/;
      const dateResult = datePattern.exec(properties["捕獲年月日"]);
      const date = dateResult != null ? dateResult[1] : "";
      // 画像は先に縦横の長さをフェッチしておく
      const images =
        properties["画像ID"] === ""
          ? []
          : await Promise.all(
              properties["画像ID"]
                .split(",")
                .map(async id => await fetchImage(id))
            );

      // 行を返す
      return {
        ID: properties["ID$"],
        入力者: name,
        市町村: city,
        区分: properties["区分"],
        捕獲年月日: date,
        "罠・発見場所": properties["罠・発見場所"],
        捕獲頭数: properties["捕獲頭数"],
        幼獣の頭数: properties["幼獣の頭数"],
        成獣の頭数: properties["成獣の頭数"],
        "幼獣・成獣": properties["幼獣・成獣"],
        性別: properties["性別"],
        妊娠の状況: properties["妊娠の状況"],
        体長: properties["体長"],
        処分方法: properties["処分方法"],
        備考: properties["備考"],
        画像: images
      };
    };

    return await Promise.all(features.map(async f => await makeRow(f)));
  }

  // テーブルのヘッダーを押されたとき：表の並び替え
  onClickHeader(key) {
    // 現在のソートキーと一致するなら，現在の順番の逆順にする
    // ソートキーが一致しないなら，正順とする
    const reverse = this.state.sortKey === key ? !this.state.reversed : false;
    const sortedTableData = this.sortTalbeData(key, reverse);
    console.log(key, reverse);
    this.setState({
      tableData: sortedTableData,
      sortKey: key,
      reversed: reverse
    });
  }

  sortTalbeData(key, reverse) {
    return this.state.tableData.sort((a, b) => {
      const getItem = data => {
        // 数値データでソートする場合
        if (
          key === "ID" ||
          key === "捕獲頭数" ||
          key === "体長" ||
          key === "幼獣の頭数" ||
          key === "成獣の頭数"
        ) {
          // 空文字はいつも下に来るようにする
          if (data[key] === "") {
            return reverse ? Number.MIN_VALUE : Number.MAX_VALUE;
          }
          // 数値に変換
          return parseFloat(data[key]);
        }
        // 日付データの場合
        if (key === "捕獲年月日") {
          // （無いけど）空の時は0
          if (data[key] === "") {
            return new Date(0);
          }
          return new Date(data[key]);
        }
        // 文字列データ
        return data[key];
      };

      // 比較用
      const aItem = getItem(a);
      const bItem = getItem(b);
      // 空文字＝未入力＝下に寄せる
      if (aItem === "" && bItem !== "") {
        return 1;
      }
      if (bItem === "" && aItem !== "") {
        return -1;
      }
      const rev = reverse ? -1 : 1;
      if (aItem > bItem) {
        return 1 * rev;
      } else if (aItem < bItem) {
        return -1 * rev;
      } else {
        // データが同じならIDで比較
        const aId = parseInt(a["ID"]);
        const bId = parseInt(b["ID"]);
        if (aId > bId) {
          return 1;
        } else if (aId < bId) {
          return -1;
        } else {
          // 本来ここに来ない
          return 0;
        }
      }
    });
  }

  // ダウンロードボタンが押されたときの処理
  // todo: IE対応
  async onClickDownload() {
    // bufferにファイルを書き出す
    const fileBuffer = await downloadExcel(
      this.state.features,
      this.state.nameList,
      this.state.images
    );
    console.log(fileBuffer);

    // 見えないaタグを作っておく
    const imaginaryA = document.createElement("a");
    document.body.appendChild(imaginaryA);
    imaginaryA.style = "display: none;";

    // bufferをblobに流し込む
    const blob = new Blob([fileBuffer], { type: "vnd.ms-excel" });
    const url = URL.createObjectURL(blob);

    imaginaryA.href = url;
    imaginaryA.download = "捕獲情報一覧.xlsx";
    imaginaryA.click();
    URL.revokeObjectURL(url);
  }

  render() {
    return (
      <div className="list">
        <Header color="primary">一覧表</Header>
        <div className="list__contents">
          <SearchForm
            onClick={this.onClickSearch.bind(this)}
            searching={this.state.searching}
          />
          <ListTable
            searched={this.state.searched}
            tableData={this.state.tableData}
            onClickDownload={this.onClickDownload.bind(this)}
            onClickHeader={this.onClickHeader.bind(this)}
            sortKey={this.state.sortKey}
            sortReversed={this.state.reversed}
          />
          <div className="list__contents__footer-adjuster"></div>
        </div>
      </div>
    );
  }
}

export default List;
