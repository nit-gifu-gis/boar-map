import React from "react";
import "./meshNoInput.scss";
import "../../../public/static/css/global.scss";
import SelectInput from "../selectInput";
import TextInput from "../textInput";

// 市町村名一覧
const CITY_LIST = [
  "安八町",
  "池田町",
  "揖斐川町",
  "恵那市",
  "大垣市",
  "大野町",
  "海津市",
  "各務原市",
  "笠松町",
  "可児市",
  "川辺町",
  "北方町",
  "岐南町",
  "岐阜市",
  "郡上市",
  "下呂市",
  "神戸町",
  "坂祝町",
  "白川町",
  "白川村",
  "関ケ原町",
  "関市",
  "高山市",
  "多治見市",
  "垂井町",
  "土岐市",
  "富加町",
  "中津川市",
  "羽島市",
  "東白川村",
  "飛騨市",
  "七宗町",
  "瑞浪市",
  "瑞穂市",
  "御嵩町",
  "美濃加茂市",
  "美濃市",
  "本巣市",
  "八百津町",
  "山県市",
  "養老町",
  "輪之内町"
];

class MeshNoInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      onChange: function changed() {}
    };
    if (this.props.onChange != undefined) {
      this.state.onChange = this.props.onChange;
    }
    this.onChangeVaule.bind(this);
    this.setValue.bind(this);
    this.initForm.bind(this);
  }

  componentDidMount() {
    if (this.props.defaultValue != null) {
      // 正規表現でcity, numを抽出
      const regexp = new RegExp(
        /^(\D+)(\d{4}-\d{2})$|^(\D+)([A-Fa-f]\d{4})$/,
        "g"
      );
      const result = regexp.exec(this.props.defaultValue);
      if (result == null) {
        // 正規表現に引っかからなかったら，初期値がないときと同じ処理をして終了
        this.initForm();
        return;
      }
      // 正規表現に引っかかったらそれぞれを取り出して
      const cityValue = result[1] ? result[1] : result[3];
      // cityが一覧に無かったら不正
      if (CITY_LIST.indexOf(cityValue) === -1) {
        // 初期値がないときと同じ処理をして終了
        this.initForm();
        return;
      }
      const numValue = result[2] ? result[2] : result[4];
      // 内部データのセットと
      this.setValue(cityValue, numValue);
      // 表示をセット
      document.getElementById(this.props.id + "City").value = cityValue;
      document.getElementById(this.props.id + "Num").value = numValue;
    } else {
      this.initForm();
    }
  }

  async initForm() {
    try {
      const city = await this.getCityName();
      console.log(city);
      // 表示をセット
      document.getElementById(this.props.id + "City").value = city;
    } catch (error) {
      console.error(error);
    }
    this.setValue(null, null, null);
  }

  // 市町村名を取得
  getCityName() {
    if (!this.props.lat || !this.props.lng) return;
    const lat = Number(this.props.lat);
    const lng = Number(this.props.lng);

    console.log(lat, lng);

    const body = {
      layerId: 5000017,
      inclusion: 0,
      buffer: 100,
      srid: 4326,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [[lng, lat]]
      }
    };

    console.log(body);

    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(
          `${SERVER_URI}/Feature/GetFeaturesByExtent.php`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            mode: "cors",
            credentials: "include",
            body: JSON.stringify(body)
          }
        );
        if (res.status === 200) {
          const json = await res.json();
          const features = json["features"];
          console.log("test", features);
          if (features.length !== 0) {
            resolve(features[0]["properties"]["NAME"]);
          } else {
            reject(null);
          }
        } else {
          const json = await res.json();
          reject(json["reason"]);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  onChangeVaule() {
    // 入力情報からメッシュIDを作る
    const cityValue = document.getElementById(this.props.id + "City").value;
    const numValueRow = document.getElementById(this.props.id + "Num").value;
    // 有効な桁数の時のみセット
    const numRegExp = new RegExp(
      /(^\d{1,4}-\d{0,2}$)|(^\d{1,4}$)|(^[A-Fa-f]\d{1,4}$)/,
      "g"
    );
    const result = numRegExp.exec(numValueRow);
    if (result) {
      // 三項演算子が見づらいですが，
      // result[1]でマッチ → (^\d{1,4}-\d{0,2}$) ＝ 頭0埋めをして4桁-2桁にする
      // result[2]でマッチ → (^\d{1,4}$) ＝ 頭を0埋めし，省略されたハイフンと下二桁(00)を補完
      // result[3]でマッチ → (^[A-Fa-f]\d{1,4}$) = 市町村が使うメッシュ番号，大文字に統一，0埋めして4桁
      const numValue = result[1]
        ? ("0000" + result[1].split("-")[0]).slice(-4) +
          "-" +
          ("00" + result[1].split("-")[1]).slice(-2)
        : result[2]
        ? ("0000" + result[2]).slice(-4) + "-00"
        : result[3]
        ? result[3].slice(0, 1).toUpperCase() +
          ("0000" + result[3].slice(1)).slice(-4)
        : null;
      console.log(numValue);
      this.setValue(cityValue, numValue);
    } else {
      this.setValue(null, null);
    }
    this.state.onChange();
  }

  setValue(cityValue, numValue) {
    // 市町村名とnum1がnullなら全体もnull
    const meshIdValue = cityValue && numValue ? cityValue + numValue : null;
    document.getElementById(this.props.id).value = meshIdValue;
  }

  render() {
    return (
      <div className="mesh-num-input">
        <div className="mesh-num-input__city-input">
          <SelectInput
            name={this.props.name + "City"}
            id={this.props.id + "City"}
            options={CITY_LIST}
            onChange={this.onChangeVaule.bind(this)}
            error={this.props.error}
          />
        </div>
        <div className="mesh-num-input__city-num1-break"></div>
        <div className="mesh-num-input__num-input">
          <TextInput
            type="text"
            id={this.props.id + "Num"}
            placeholder="0000-00 または A0000"
            onChange={this.onChangeVaule.bind(this)}
            error={this.props.error}
          />
        </div>
        <br />
        <input
          type="text"
          className="mesh-num-input__mesh-input"
          name={this.props.name}
          id={this.props.id}
          style={{ display: "none" }}
        />
      </div>
    );
  }
}

export default MeshNoInput;
