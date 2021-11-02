import React from "react";
import "./meshNoInput.scss";
import "../../../public/static/css/global.scss";
import SelectInput from "../selectInput";
import TextInput from "../textInput";

import { SERVER_URI } from "../../../utils/gis";

class BoarNoInput extends React.Component {
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
  }

  componentDidMount() {
    if (this.props.defaultValue != null) {
      const val = this.props.defaultValue.split("-");
      console.log(val);
      document.getElementById(this.props.id + "_sec1").value = val[0];
      if (val.length >= 2) {
        document.getElementById(this.props.id + "_sec2").value = val[1];
      }

      this.onChangeVaule();
    }
  }

  onChangeVaule() {
    const areaValue = document.getElementById(this.props.id + "_sec1").value;
    const numValueRow = document.getElementById(this.props.id + "_sec2").value;

    if (areaValue.match(/^[A-Za-z]{3}\d{3}$/) && numValueRow.match(/^\d{3}$/)) {
      console.log("format ok.");
      this.setValue(areaValue, numValueRow);
    } else {
      this.setValue(null, null);
    }

    this.state.onChange();
  }

  setValue(areaValue, numValue) {
    const boarIdValue =
      areaValue && numValue ? areaValue + "-" + numValue : null;
    document.getElementById(this.props.id).value = boarIdValue;
  }

  render() {
    return (
      <div className="boar-num-input">
        <div className="boar-num-input__city-input">
          <TextInput
            type="text"
            id={this.props.id + "_sec1"}
            placeholder="ABC123"
            onChange={this.onChangeVaule.bind(this)}
            error={this.props.error}
          />
        </div>
        <div className="boar-num-input__city-num-break"></div>
        <div className="boar-num-input__num-input">
          <TextInput
            type="text"
            id={this.props.id + "_sec2"}
            placeholder="123"
            onChange={this.onChangeVaule.bind(this)}
            error={this.props.error}
          />
        </div>
        <br />
        <input
          type="text"
          className="boar-num-input__mesh-input"
          name={this.props.name}
          id={this.props.id}
          style={{ display: "none" }}
        />
      </div>
    );
  }
}

export default BoarNoInput;
