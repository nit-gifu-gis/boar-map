import React from "react";
import "./infoInput.scss";
import "../../../public/static/css/global.scss";
import TextInput from "../../atomos/textInput";
import DateInput from "../../atomos/dateInput";

class InfoInput extends React.Component {
  render() {
    let input = null;
    switch (this.props.type) {
      case "number":
        input = (
          <TextInput
            type="number"
            name={this.props.name}
            id={this.props.name}
            placeholder="数字で入力"
          />
        );
        break;
      case "date":
        input = <DateInput name={this.props.name} id={this.props.name} />;
        break;
      default:
        break;
    }
    return (
      <div className="info-input">
        <div className="title">{this.props.title}</div>
        <div className="input-area">{input}</div>
      </div>
    );
  }
}

export default InfoInput;
