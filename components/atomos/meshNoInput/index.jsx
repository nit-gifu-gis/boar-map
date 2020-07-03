import React from "react";
import "./meshNoInput.scss";
import "../../../public/static/css/global.scss";
import SelectInput from "../selectInput";
import TextInput from "../textInput";

// 緯度経度から市町村名取ってくるAPI使いたいけど，使っていいかどうかが分からない…
// http://geoapi.heartrails.com/api.html#geolocation
// GISのAPIに住所から緯度経度取るやつはあるのに逆はないの…？

// 諦めて市町村名一覧
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
      // 正規表現でcity, num1, num2を抽出
      const regexp = new RegExp("(\\D+)(\\d{1,4})-(\\d{1,2})", "g");
      const result = regexp.exec(this.props.defaultValue);
      if (result == null) {
        // 正規表現に引っかからなかったら，初期値がないときと同じ処理をして終了
        this.initForm();
        return;
      }
      // 正規表現に引っかかったらそれぞれを取り出して
      const cityValue = result[1];
      // cityが一覧に無かったら不正
      if (CITY_LIST.indexOf(cityValue) === -1) {
        // 初期値がないときと同じ処理をして終了
        this.initForm();
        return;
      }
      const num1Value = result[2];
      const num2Value = result[3];
      // 内部データのセットと
      this.setValue(cityValue, num1Value, num2Value);
      // 表示をセット
      document.getElementById(this.props.id + "City").value = cityValue;
      document.getElementById(this.props.id + "Num1").value = num1Value;
      document.getElementById(this.props.id + "Num2").value = num2Value;
    } else {
      this.initForm();
    }
  }

  initForm() {
    this.setValue(null, null, null);
  }

  onChangeVaule() {
    // 入力情報からメッシュIDを作る
    const cityValue = document.getElementById(this.props.id + "City").value;
    const num1Value = document.getElementById(this.props.id + "Num1").value;
    const num2Value = document.getElementById(this.props.id + "Num2").value;
    // 有効な桁数の時のみセット
    if (num1Value.length <= 4 && num2Value.length <= 2) {
      this.setValue(cityValue, num1Value, num2Value);
    } else {
      this.setValue(null, null, null);
    }
    this.state.onChange();
  }

  setValue(cityValue, num1Value, num2Value) {
    // 市町村名とnum1がnullなら全体もnull
    // num2のみ未入力なら00をセット
    let meshIdValue = null;
    if (cityValue && num1Value) {
      // 市町村名＋４桁数値＋半角ハイフン＋２桁数値
      meshIdValue = cityValue;
      meshIdValue += ("0000" + num1Value).slice(-4);
      meshIdValue += "-";
      meshIdValue += ("00" + num2Value).slice(-2);
    }
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
        <div className="mesh-num-input__num1-input">
          <TextInput
            type="number"
            min="0"
            step="1"
            max="9999"
            id={this.props.id + "Num1"}
            placeholder="4桁"
            onChange={this.onChangeVaule.bind(this)}
            error={this.props.error}
          />
        </div>
        <div className="mesh-num-input__hyphen">-</div>
        <div className="mesh-num-input__num2-input">
          <TextInput
            type="number"
            min="0"
            step="1"
            max="99"
            id={this.props.id + "Num2"}
            placeholder="2桁"
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
