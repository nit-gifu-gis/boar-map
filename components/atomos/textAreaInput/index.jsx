import React from "react";
import "./textAreaInput.scss";
import "../../../public/static/css/global.scss";

class TextAreaInput extends React.Component {
  render() {
    if (this.props.required) {
      return (
        <textarea
          className="text-area-input"
          name={this.props.name}
          id={this.props.id}
          cols={this.props.cols}
          rows={this.props.rows}
          maxLength={this.props.maxLength}
          placeholder={this.props.placeholder}
          onChange={this.props.onChange}
          required
        >
          {this.props.children}
        </textarea>
      );
    } else {
      return (
        <textarea
          className="text-area-input"
          name={this.props.name}
          id={this.props.id}
          cols={this.props.cols}
          rows={this.props.rows}
          maxLength={this.props.maxLength}
          placeholder={this.props.placeholder}
          onChange={this.props.onChange}
        >
          {this.props.children}
        </textarea>
      );
    }
  }
}

export default TextAreaInput;
