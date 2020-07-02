import React from "react";
import "./infoInput.scss";
import "../../../public/static/css/global.scss";
import TextInput from "../../atomos/textInput";
import DateInput from "../../atomos/dateInput";
import SelectInput from "../../atomos/selectInput";
import TextAreaInput from "../../atomos/textAreaInput";
import ImagesInput from "../../atomos/imagesInput";
import MeshNoInput from "../../atomos/meshNoInput";

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
            max={this.props.max}
            min={this.props.min}
            defaultValue={this.props.defaultValue}
            step={this.props.step}
            onChange={this.props.onChange}
            placeholder="数字で入力"
            error={this.props.errorMessage != null}
          />
        );
        break;
      case "date":
        input = (
          <DateInput
            name={this.props.name}
            id={this.props.name}
            date={this.props.defaultValue}
            onChange={this.props.onChange}
            error={this.props.errorMessage != null}
          />
        );
        break;
      case "select":
        input = (
          <SelectInput
            name={this.props.name}
            id={this.props.name}
            options={this.props.options}
            onChange={this.props.onChange}
            defaultValue={this.props.defaultValue}
            error={this.props.errorMessage != null}
          />
        );
        break;
      case "text-area":
        input = (
          <TextAreaInput
            name={this.props.name}
            id={this.props.name}
            cols={this.props.cols}
            rows={this.props.rows}
            maxLength={this.props.maxLength}
            placeholder={this.props.placeholder}
            defaultValue={this.props.defaultValue}
            onChange={this.props.onChange}
            error={this.props.errorMessage != null}
          />
        );
        break;
      case "images":
        input = (
          <ImagesInput
            onChange={this.props.onChange}
            error={this.props.errorMessage != null}
          />
        );
        break;
      case "mesh-num":
        input = (
          <MeshNoInput
            name={this.props.name}
            id={this.props.name}
            defaultValue={this.props.defaultValue}
            onChange={this.props.onChange}
            error={this.props.errorMessage != null}
          />
        );
        break;
      default:
        break;
    }
    // 必須項目にはマークを付ける
    let requiredMark = null;
    if (this.props.required) {
      requiredMark = <span className="info-input__required-mark">*</span>;
    }
    let errorMessage = null;
    if (this.props.errorMessage) {
      errorMessage = (
        <div className="info-input__error">{this.props.errorMessage}</div>
      );
    }
    return (
      <div className="info-input">
        <div className="info-input__title">
          {this.props.title}
          {requiredMark}
        </div>
        {errorMessage}
        <div className="info-input__input-area">{input}</div>
      </div>
    );
  }
}

export default InfoInput;
