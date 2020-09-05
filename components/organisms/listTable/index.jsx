import "./listTable.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import "../../../utils/statics";

class ListTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  showImages(ids) {
    const idsArray = ids.split(",");
    return idsArray.map(id => {
      if (id == "") {
        return <div className="">画像なし</div>;
      }
      const url = `${IMAGE_SERVER_URI}/view.php?type=${"boar"}&id=${id}`;
      return (
        <img src={url} className="list-table__table__row__image" alt={id} />
      );
    });
  }

  render() {
    const features = this.props.features;

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

    const featuresList = features.map(f => {
      const data = f.properties;
      // メッシュ番号から市町村を取り出す
      const cityPattern = /(^\D+)\d-?\d/;
      const cityResult = cityPattern.exec(data["メッシュ番号"]);
      const city = cityResult != null ? cityResult[1] : "";
      // 捕獲年月日からは時刻を削除
      const datePattern = /(^[\d/-]+)\s.*/;
      const dateResult = datePattern.exec(data["捕獲年月日"]);
      const date = dateResult != null ? dateResult[1] : "";
      return (
        <tr className="list-table__table__row" key={data["ID$"]}>
          <td style={{ textAlign: "right" }}>{data["ID$"]}</td>
          <td style={{ textAlign: "left" }}>{data["入力者"]}</td>
          <td style={{ textAlign: "left" }}>{city}</td>
          <td style={{ textAlign: "left" }}>{data["区分"]}</td>
          <td style={{ textAlign: "left" }}>{date}</td>
          <td style={{ textAlign: "left" }}>{data["罠・発見場所"]}</td>
          <td style={{ textAlign: "right" }}>{data["捕獲頭数"]}</td>
          <td style={{ textAlign: "left" }}>{data["幼獣・成獣"]}</td>
          <td style={{ textAlign: "left" }}>{data["性別"]}</td>
          <td style={{ textAlign: "left" }}>{data["妊娠の状況"]}</td>
          <td style={{ textAlign: "right" }}>{data["体長"]}</td>
          <td style={{ textAlign: "left" }}>{data["処分方法"]}</td>
          <td style={{ textAlign: "left" }}>{data["備考"]}</td>
          <td style={{ textAlign: "left" }}>
            {/* {data["画像ID"]} */}
            {this.showImages(data["画像ID"])}
          </td>
        </tr>
      );
    });
    return (
      <div className="list-table">
        <div className="list-table__title">検索結果</div>
        <table className="list-table__table">
          <tbody>
            <tr className="list-table__table__header">
              <th>ID</th>
              <th>入力者</th>
              <th>市町村</th>
              <th>区分</th>
              <th>捕獲年月日</th>
              <th>
                わなの種類
                <br />
                発見場所
              </th>
              <th>捕獲頭数</th>
              <th>幼獣・成獣の別</th>
              <th>性別</th>
              <th>妊娠の状況</th>
              <th>体長</th>
              <th>処分方法</th>
              <th>
                備考
                <br />
                （捕獲を手伝った者の氏名）
                <br />
                （遠沈管番号）
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
