import React from "react";
import "./textAreaInput.scss";
import "../../../public/static/css/global.scss";

class TextAreaInput extends React.Component {
  render() {
    let className = "text-area-input__input";
    if (this.props.error) {
      className += "--error";
    }
    let input;
    if (this.props.required) {
      input = (
        <textarea
          className={className}
          name={this.props.name}
          id={this.props.id}
          cols={this.props.cols}
          rows={this.props.rows}
          maxLength={this.props.maxLength}
          placeholder={this.props.placeholder}
          defaultValue={this.props.defaultValue}
          onChange={this.props.onChange}
          required
        >
          {this.props.children}
        </textarea>
      );
    } else {
      input = (
        <textarea
          className={className}
          name={this.props.name}
          id={this.props.id}
          cols={this.props.cols}
          rows={this.props.rows}
          maxLength={this.props.maxLength}
          placeholder={this.props.placeholder}
          defaultValue={this.props.defaultValue}
          onChange={this.props.onChange}
        >
          {this.props.children}
        </textarea>
      );
    }
    return <div className="text-area-input">{input}</div>;
  }
}

export default TextAreaInput;
