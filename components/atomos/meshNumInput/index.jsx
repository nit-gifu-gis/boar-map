import React from "react";
import "./meshNumInput.scss";
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

class MeshNumInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
  }

  componentDidMount() {}

  onChangeVaule() {}

  render() {
    return (
      <div className="mesh_num_input">
        <div className="city_input">
          <SelectInput
            name={this.props.name + "City"}
            id={this.props.id + "City"}
            options={CITY_LIST}
            onChange={this.onChangeVaule}
            defaultValue={"選択..."}
          />
        </div>
        <div className="num1_input">
          <TextInput
            type="number"
            min="0"
            step="1"
            max="9999"
            id={this.props.id + "Num1"}
            placeholder="4桁"
            defaultValue={9999}
            onChange={this.onChangeVaule}
          />
        </div>
        <div className="hyphen">-</div>
        <div className="num2_input">
          <TextInput
            type="number"
            min="0"
            step="1"
            max="99"
            id={this.props.id + "Num2"}
            placeholder="2桁"
            defaultValue={99}
            onChange={this.onChangeVaule}
          />
        </div>
        <br />
        <input
          type="text"
          className="mesh_input"
          name={this.props.name}
          id={this.props.id}
          style={{ display: "none" }}
        />
      </div>
    );
  }
}

export default MeshNumInput;
