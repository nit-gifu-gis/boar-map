import "./listTable.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";

class ListTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      features: props.features
    };
  }

  render() {
    const features = this.props.features;
    const featuresList = features.map(f => {
      const data = f.properties;
      return (
        <tr className="list-table__table__row" key={data["ID$"]}>
          <td>{data["ID$"]}</td>
          <td>{data["入力者"]}</td>
          <td>{data["メッシュ番号"]}</td>
          <td>{data["区分"]}</td>
          <td>{data["捕獲年月日"]}</td>
          <td>{data["罠・発見場所"]}</td>
          <td>{data["捕獲頭数"]}</td>
          <td>{data["幼獣・成獣"]}</td>
          <td>{data["性別"]}</td>
          <td>{data["妊娠の状況"]}</td>
          <td>{data["体長"]}</td>
          <td>{data["処分方法"]}</td>
          <td>{data["備考"]}</td>
          <td>{data["画像ID"]}</td>
        </tr>
      );
    });
    return (
      <div className="list-table">
        <div className="list-table__title">てーぶる（工事中）</div>
        <table className="list-table__table">
          <tbody>
            <tr className="list-table__table__header">
              <th>ID</th>
              <th>入力者</th>
              <th>市町村</th>
              <th>区分</th>
              <th>捕獲年月日</th>
              <th>わなの種類・発見場所</th>
              <th>捕獲頭数</th>
              <th>幼獣・成獣の別</th>
              <th>性別</th>
              <th>妊娠の状況</th>
              <th>体長</th>
              <th>処分方法</th>
              <th>備考（捕獲を手伝った者の氏名）（遠沈管番号）</th>
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
