import React from "react";
import "./textInput.scss";
import "../../../public/static/css/global.scss";

class TextInput extends React.Component {
  render() {
    let className = "text-input__input";
    let input;
    if (this.props.error) {
      className += "--error";
    }
    if (this.props.required) {
      input = (
        <input
          type={this.props.type}
          className={className}
          name={this.props.name}
          id={this.props.id}
          placeholder={this.props.placeholder}
          defaultValue={this.props.defaultValue}
          max={this.props.max}
          min={this.props.min}
          step={this.props.step}
          onChange={this.props.onChange}
          disabled={this.props.disabled}
          required
        />
      );
    } else {
      input = (
        <input
          type={this.props.type}
          className={className}
          name={this.props.name}
          id={this.props.id}
          placeholder={this.props.placeholder}
          defaultValue={this.props.defaultValue}
          max={this.props.max}
          min={this.props.min}
          step={this.props.step}
          onChange={this.props.onChange}
          disabled={this.props.disabled}
        />
      );
    }
    return <div className="text-input">{input}</div>;
  }
}

export default TextInput;
