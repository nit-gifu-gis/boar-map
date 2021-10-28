import "./boarInfo.scss";
import React from "react";
import InfoDiv from "../../molecules/infoDiv";
import Divider from "../../atomos/divider";

class BoarInfo extends React.Component {
  render() {
    // 妊娠の状況は性別がメスかつ成獣の時のみ表示
    let pregnantInfo = null;
    if (
      this.props.detail["properties"]["性別"] === "メス" &&
      this.props.detail["properties"]["幼獣・成獣"] === "成獣"
    ) {
      pregnantInfo = (
        <InfoDiv
          title="妊娠の状況"
          type="text"
          data={this.props.detail["properties"]["妊娠の状況"]}
        />
      );
    }
    // 捕獲頭数は箱わなが選択された時のみ表示
    let catchNumInfo = null;
    if (this.props.detail["properties"]["罠・発見場所"] === "箱わな") {
      let childrenNum = 0;
      let adultsNum = 0;
      this.props.detail["properties"]["捕獲いのしし情報"].forEach(v => {
        if (v["成獣幼獣別"] === "成獣") adultsNum++;
        else childrenNum++;
      });
      const catchNum = this.props.detail["properties"]["捕獲頭数"];
      const text =
        catchNum + "（幼獣: " + childrenNum + " 成獣: " + adultsNum + "）";
      catchNumInfo = <InfoDiv title="捕獲頭数" type="text" data={text} />;
    }

    return (
      <div className="boar-info">
        <InfoDiv
          title="場所"
          type="location"
          data={{
            lat: this.props.detail["geometry"]["coordinates"][1],
            lng: this.props.detail["geometry"]["coordinates"][0]
          }}
        />
        <InfoDiv
          title="画像"
          type="images"
          data={{
            type: "boar",
            objectURLs: this.props.objectURLs,
            imageIDs: this.props.imageIDs,
            confirmMode: this.props.confirmMode
          }}
        />
        <InfoDiv
          title="メッシュ番号"
          type="text"
          data={this.props.detail["properties"]["メッシュ番号"]}
        />
        <InfoDiv title="区分" data={this.props.detail["properties"]["区分"]} />
        <InfoDiv
          title="捕獲年月日"
          type="date"
          data={this.props.detail["properties"]["捕獲年月日"]}
        />
        <InfoDiv
          title="わな・発見場所"
          data={this.props.detail["properties"]["罠・発見場所"]}
        />
        {catchNumInfo}
        {this.props.detail["properties"]["捕獲いのしし情報"].map((v, index) => {
          return (
            <>
              {index > 0 ? <Divider /> : <></>}
              {this.props.detail["properties"]["捕獲いのしし情報"].length >
              1 ? (
                <div className="boar_info_form__nthbody">
                  <div className="text">{index + 1}体目</div>
                </div>
              ) : (
                <></>
              )}
              <InfoDiv title="幼獣・成獣の別" data={v["成獣幼獣別"]} />
              <InfoDiv title="性別" type="text" data={v["性別"]} />
              <InfoDiv title="体長" type="number" data={v["体長"]} unit="cm" />
              <InfoDiv
                title="体重 （体長から自動計算）"
                type="number"
                data={v["体重"]}
                unit="kg"
              />
              {pregnantInfo}
              <InfoDiv title="処分方法" type="text" data={v["処分方法"]} />
              <InfoDiv
                title="備考（遠沈管番号）（作業時間）"
                type="longText"
                data={v["備考"]}
              />
            </>
          );
        })}
      </div>
    );
  }
}

export default BoarInfo;
