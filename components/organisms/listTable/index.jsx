import "./listTable.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import "../../../utils/statics";
import RoundButton from "../../atomos/roundButton";

import { SERVER_URI } from "../../../utils/gis";

class ListTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: "ID$",
      sortReverse: false,
      onClick: () => {}
    };
    if (props.onClick != undefined) {
      this.state.onClick = props.onClick;
    }
  }

  showImages(id) {
    // プリロードしておいた画像を引っ張ってくる
    const images = this.props.images.find(v => v.id === id).images;
    const imgs = images.map(image => {
      if (id == "") {
        return <div className="">画像なし</div>;
      }
      const url = `${SERVER_URI}/Image/GetImage.php?id=${image.id}`;
      // 長辺が200pxになるように調整する
      const wRow = image.w;
      const hRow = image.h;
      const calcShort = (long, short) => {
        return short * (200.0 / long);
      };
      const w = wRow > hRow ? 200 : calcShort(hRow, wRow);
      const h = wRow > hRow ? calcShort(wRow, hRow) : 200;
      // 押したら別タブで開くため，aタグの中に入れる
      return (
        <a
          className="list-table__table__row__image-cell__image"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={url} alt={id} width={w} height={h} />
        </a>
      );
    });
    return <div className="list-table__table__row__image-cell">{imgs}</div>;
  }

  onClickHeader(key) {
    console.log(this.state.sortKey, this.state.sortReverse);
    if (key == this.state.sortKey) {
      const old = this.state.sortReverse;
      this.setState({ sortReverse: !old });
    } else {
      this.setState({ sortKey: key, sortReverse: false });
    }
  }

  sortFeatures(features) {
    const tmp = features.slice();
    return tmp.sort((a, b) => {
      // 比較用のデータを取り出す
      const getItem = feature => {
        // プロパティ
        const p = feature.properties;
        // 数値データの時
        if (
          this.state.sortKey == "ID$" ||
          this.state.sortKey == "枝番" ||
          this.state.sortKey == "捕獲頭数" ||
          this.state.sortKey == "体長" ||
          this.state.sortKey == "体重"
        ) {
          // 空文字はいつも下に来るようにする
          if (p[this.state.sortKey] == "") {
            return this.state.sortReverse ? Number.MIN_VALUE : Number.MAX_VALUE;
          }
          // 実数に変換
          return parseFloat(p[this.state.sortKey]);
        }
        // 日付データの時
        if (
          this.state.sortKey == "捕獲年月日" ||
          this.state.sortKey == "PCR検査日"
        ) {
          // 空の時は0
          if (p[this.state.sortKey] == "") {
            return new Date(0);
          }
          return new Date(p[this.state.sortKey]);
        }
        // 文字列データ
        return p[this.state.sortKey];
      };

      const aItem = getItem(a);
      const bItem = getItem(b);
      // 空文字＝未入力データ＝下に寄せる
      if (aItem == "" && bItem != "") {
        return 1;
      }
      if (bItem == "" && aItem != "") {
        return -1;
      }
      const rev = this.state.sortReverse ? -1 : 1;
      if (aItem > bItem) {
        return 1 * rev;
      } else if (aItem < bItem) {
        return -1 * rev;
      } else {
        // データが同じ時はIDで比較
        const aId = parseInt(a.properties["ID$"]);
        const bId = parseInt(b.properties["ID$"]);
        const aBr = parseInt(a.properties["枝番"] ? a.properties["枝番"] : 1);
        const bBr = parseInt(b.properties["枝番"] ? b.properties["枝番"] : 1);
        if (aId > bId) {
          return 1;
        } else if (aId < bId) {
          return -1;
        } else {
          // IDが一緒なら枝番で比較
          if (aBr > bBr) {
            return 1;
          } else if (aBr < bBr) {
            return -1;
          }
          // 本来ここには来ない
          return 0;
        }
      }
    });
  }

  onClickExport() {
    this.state.onClick();
  }

  render() {
    // Sortkeyで並び替え
    const features = this.props.features;
    const sorted = this.sortFeatures(features);

    // 検索してないならインフォメーションを表示
    if (!this.props.searched) {
      return (
        <div className="list-table">
          <div className="list-table__how-to">
            検索条件に条件を入力して検索してください．
          </div>
        </div>
      );
    }

    // 無いなら表示しない
    if (features == null) {
      return <div className="list-table">エラー：再読込してください．</div>;
    }

    const featuresList = sorted.map(f => {
      const data = f.properties;
      return (
        <tr
          className="list-table__table__row"
          key={`${data["ID$"]}-${data["枝番"]}`}
        >
          <td style={{ textAlign: "right" }}>{data["ID$"]}</td>
          <td style={{ textAlign: "left" }}>
            {data["枝番"] ? data["枝番"] : 1}
          </td>
          <td style={{ textAlign: "left" }}>{data["入力者"]}</td>
          <td style={{ textAlign: "left" }}>{data["メッシュ番号"]}</td>
          <td style={{ textAlign: "left" }}>{data["区分"]}</td>
          <td style={{ textAlign: "left" }}>{data["捕獲年月日"]}</td>
          <td style={{ textAlign: "left" }}>{data["罠・発見場所"]}</td>
          <td style={{ textAlign: "left" }}>{data["位置情報"]}</td>
          <td style={{ textAlign: "right" }}>{data["捕獲頭数"]}</td>
          <td style={{ textAlign: "right" }}>{data["幼獣の頭数"]}</td>
          <td style={{ textAlign: "right" }}>{data["成獣の頭数"]}</td>
          <td style={{ textAlign: "left" }}>{data["幼獣・成獣"]}</td>
          <td style={{ textAlign: "left" }}>{data["性別"]}</td>
          <td style={{ textAlign: "left" }}>{data["妊娠の状況"]}</td>
          <td style={{ textAlign: "right" }}>{data["体長"]}</td>
          <td style={{ textAlign: "right" }}>{data["体重"]}</td>
          <td style={{ textAlign: "left" }}>{data["処分方法"]}</td>
          <td style={{ textAlign: "left" }}>{data["備考"]}</td>
          <td style={{ textAlign: "left" }}>{data["ジビエ業者"]}</td>
          <td style={{ textAlign: "left" }}>
            {data["個体管理番号"] ? data["個体管理番号"] : "(未入力)"}
          </td>
          <td style={{ textAlign: "left" }}>
            {data["PCR検査日"] ? data["PCR検査日"] : "(未入力)"}
          </td>
          <td style={{ textAlign: "left" }}>
            {data["PCR検査結果"] ? data["PCR検査結果"] : "(未入力)"}
          </td>
          <td style={{ textAlign: "right" }}>
            {data["確認番号"] ? data["確認番号"] : "なし"}
          </td>
          <td style={{ textAlign: "left" }}>{this.showImages(data["ID$"])}</td>
        </tr>
      );
    });
    // 並び替えの三角用のクラス名
    const thClassName = key => {
      if (this.state.sortKey == key) {
        if (this.state.sortReverse) {
          return "sortable desc";
        } else {
          return "sortable asc";
        }
      } else {
        return "sortable";
      }
    };
    return (
      <div className="list-table">
        <div className="list-table__title">
          検索結果
          <div className="list-table__title__export-button-wrapper">
            <RoundButton
              color="excel"
              bind={this.onClickExport.bind(this)}
              enabled={!this.props.downloading}
            >
              ダウンロード
            </RoundButton>
          </div>
        </div>
        <table className="list-table__table">
          <tbody>
            <tr className="list-table__table__header">
              <th
                className={thClassName("ID$")}
                onClick={this.onClickHeader.bind(this, "ID$")}
              >
                ID
              </th>
              <th
                className={thClassName("枝番")}
                onClick={this.onClickHeader.bind(this, "枝番")}
              >
                枝番
              </th>
              <th
                className={thClassName("入力者")}
                onClick={this.onClickHeader.bind(this, "入力者")}
              >
                入力者
              </th>
              <th
                className={thClassName("メッシュ番号")}
                onClick={this.onClickHeader.bind(this, "メッシュ番号")}
              >
                メッシュ番号
              </th>
              <th
                className={thClassName("区分")}
                onClick={this.onClickHeader.bind(this, "区分")}
              >
                区分
              </th>
              <th
                className={thClassName("捕獲年月日")}
                onClick={this.onClickHeader.bind(this, "捕獲年月日")}
              >
                捕獲
                <br />
                年月日
              </th>
              <th
                className={thClassName("罠・発見場所")}
                onClick={this.onClickHeader.bind(this, "罠・発見場所")}
              >
                わなの種類
                <br />
                発見場所
              </th>
              <th
                className={thClassName("位置情報")}
                onClick={this.onClickHeader.bind(this, "位置情報")}
              >
                座標
              </th>
              <th
                className={thClassName("捕獲頭数")}
                onClick={this.onClickHeader.bind(this, "捕獲頭数")}
              >
                捕獲
                <br />
                頭数
              </th>
              <th
                className={thClassName("幼獣の頭数")}
                onClick={this.onClickHeader.bind(this, "幼獣の頭数")}
              >
                幼獣の
                <br />
                頭数
              </th>
              <th
                className={thClassName("成獣の頭数")}
                onClick={this.onClickHeader.bind(this, "成獣の頭数")}
              >
                成獣の
                <br />
                頭数
              </th>
              <th
                className={thClassName("幼獣・成獣")}
                onClick={this.onClickHeader.bind(this, "幼獣・成獣")}
              >
                幼獣
                <br />
                成獣
              </th>
              <th
                className={thClassName("性別")}
                onClick={this.onClickHeader.bind(this, "性別")}
              >
                性別
              </th>
              <th
                className={thClassName("妊娠の状況")}
                onClick={this.onClickHeader.bind(this, "妊娠の状況")}
              >
                妊娠の
                <br />
                状況
              </th>
              <th
                className={thClassName("体長")}
                onClick={this.onClickHeader.bind(this, "体長")}
              >
                体長
              </th>
              <th
                className={thClassName("体重")}
                onClick={this.onClickHeader.bind(this, "体重")}
              >
                体重
              </th>
              <th
                className={thClassName("処分方法")}
                onClick={this.onClickHeader.bind(this, "処分方法")}
              >
                処分
                <br />
                方法
              </th>
              <th>
                備考
                <br />
                （遠沈管番号）
              </th>
              <th
                className={thClassName("ジビエ業者")}
                onClick={this.onClickHeader.bind(this, "ジビエ業者")}
              >
                ジビエ業者
              </th>
              <th
                className={thClassName("個体管理番号")}
                onClick={this.onClickHeader.bind(this, "個体管理番号")}
              >
                個体管理番号
              </th>
              <th
                className={thClassName("PCR検査日")}
                onClick={this.onClickHeader.bind(this, "PCR検査日")}
              >
                PCR検査日
              </th>
              <th
                className={thClassName("PCR検査結果")}
                onClick={this.onClickHeader.bind(this, "PCR検査結果")}
              >
                PCR検査結果
              </th>
              <th
                className={thClassName("確認番号")}
                onClick={this.onClickHeader.bind(this, "確認番号")}
              >
                確認番号
              </th>
              <th>写真</th>
            </tr>
            {featuresList}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ListTable;
