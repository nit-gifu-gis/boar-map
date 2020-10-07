import "./listTable.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import "../../../utils/statics";
import RoundButton from "../../atomos/roundButton";

class ListTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onClickDownload: () => {
        return;
      },
      onClickHeader: key => {
        console.log("正解のほう", key);
        return;
      }
    };
    if (this.props.onClickDownload != undefined) {
      this.state.onClickDownload = this.props.onClickDownload;
    }
    if (this.props.onClickHeader != undefined) {
      this.state.onClickHeader = this.props.onClickHeader;
    }
  }

  render() {
    const tableData = this.props.tableData;
    console.log("listTable tableData", tableData);

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
    if (tableData == null) {
      return <div className="list-table">エラー：再読込してください．</div>;
    }

    const createImageDiv = imageData => {
      if (imageData.length === 0) {
        return <div className="">画像なし</div>;
      }
      const imgs = imageData.map(d => {
        // 長編が200pxになるように調整
        const calcShort = (long, short) => {
          return short * (200.0 / long);
        };
        const width = d.w > d.h ? 200 : calcShort(d.h, d.w);
        const height = d.w > d.h ? calcShort(d.w, d.h) : 200;
        // 押したら別タブで開くため，aタグの中に入れる
        return (
          <a
            className="list-table__table__row__image-cell__image"
            href={d.src}
            target="_blank"
            rel="noopener noreferrer"
            key={d.id}
          >
            <img src={d.src} alt={d.id} width={width} height={height} />
          </a>
        );
      });
      return <div className="list-table__table__row__image-cell">{imgs}</div>;
    };

    const table = tableData.map(data => {
      return (
        <tr className="list-table__table__row" key={data["ID"]}>
          <td style={{ textAlign: "right" }}>{data["ID"]}</td>
          <td style={{ textAlign: "left" }}>{data["入力者"]}</td>
          <td style={{ textAlign: "left" }}>{data["市町村"]}</td>
          <td style={{ textAlign: "left" }}>{data["区分"]}</td>
          <td style={{ textAlign: "left" }}>{data["捕獲年月日"]}</td>
          <td style={{ textAlign: "left" }}>{data["罠・発見場所"]}</td>
          <td style={{ textAlign: "right" }}>{data["捕獲頭数"]}</td>
          <td style={{ textAlign: "right" }}>{data["幼獣の頭数"]}</td>
          <td style={{ textAlign: "right" }}>{data["成獣の頭数"]}</td>
          <td style={{ textAlign: "left" }}>{data["幼獣・成獣"]}</td>
          <td style={{ textAlign: "left" }}>{data["性別"]}</td>
          <td style={{ textAlign: "left" }}>{data["妊娠の状況"]}</td>
          <td style={{ textAlign: "right" }}>{data["体長"]}</td>
          <td style={{ textAlign: "left" }}>{data["処分方法"]}</td>
          <td style={{ textAlign: "left" }}>{data["備考"]}</td>
          <td style={{ textAlign: "left" }}>{createImageDiv(data["画像"])}</td>
        </tr>
      );
    });

    // 並び替えの三角用のクラス名
    const thClassName = key => {
      if (this.props.sortKey === key) {
        if (this.props.sortReversed) {
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
        <div className="list-table__header">
          <div className="list-table__header__title">検索結果</div>
          <div className="list-table__header__download-button">
            <RoundButton color="excel" bind={this.state.onClickDownload}>
              Excel形式でDL
            </RoundButton>
          </div>
        </div>
        <table className="list-table__table">
          <tbody>
            <tr className="list-table__table__header">
              <th
                className={thClassName("ID")}
                onClick={this.state.onClickHeader.bind(this, "ID")}
              >
                ID
              </th>
              <th
                className={thClassName("入力者")}
                onClick={this.state.onClickHeader.bind(this, "入力者")}
              >
                入力者
              </th>
              <th
                className={thClassName("市町村")}
                onClick={this.state.onClickHeader.bind(this, "市町村")}
              >
                市町村
              </th>
              <th
                className={thClassName("区分")}
                onClick={this.state.onClickHeader.bind(this, "区分")}
              >
                区分
              </th>
              <th
                className={thClassName("捕獲年月日")}
                onClick={this.state.onClickHeader.bind(this, "捕獲年月日")}
              >
                捕獲
                <br />
                年月日
              </th>
              <th
                className={thClassName("罠・発見場所")}
                onClick={this.state.onClickHeader.bind(this, "罠・発見場所")}
              >
                わなの種類
                <br />
                発見場所
              </th>
              <th
                className={thClassName("捕獲頭数")}
                onClick={this.state.onClickHeader.bind(this, "捕獲頭数")}
              >
                捕獲
                <br />
                頭数
              </th>
              <th
                className={thClassName("幼獣の頭数")}
                onClick={this.state.onClickHeader.bind(this, "幼獣の頭数")}
              >
                幼獣の
                <br />
                頭数
              </th>
              <th
                className={thClassName("成獣の頭数")}
                onClick={this.state.onClickHeader.bind(this, "成獣の頭数")}
              >
                成獣の
                <br />
                頭数
              </th>
              <th
                className={thClassName("幼獣・成獣")}
                onClick={this.state.onClickHeader.bind(this, "幼獣・成獣")}
              >
                幼獣
                <br />
                成獣
              </th>
              <th
                className={thClassName("性別")}
                onClick={this.state.onClickHeader.bind(this, "性別")}
              >
                性別
              </th>
              <th
                className={thClassName("妊娠の状況")}
                onClick={this.state.onClickHeader.bind(this, "妊娠の状況")}
              >
                妊娠の
                <br />
                状況
              </th>
              <th
                className={thClassName("体長")}
                onClick={this.state.onClickHeader.bind(this, "体長")}
              >
                体長
              </th>
              <th
                className={thClassName("処分方法")}
                onClick={this.state.onClickHeader.bind(this, "処分方法")}
              >
                処分
                <br />
                方法
              </th>
              <th>
                備考
                <br />
                （捕獲を手伝った者の氏名）
                <br />
                （遠沈管番号）
              </th>
              <th>画像</th>
            </tr>
            {table}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ListTable;
