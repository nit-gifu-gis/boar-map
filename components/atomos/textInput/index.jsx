import React from "react";
import "./textInput.scss";
import "../../../public/static/css/global.scss";

class TextInput extends React.Component {
  render() {
    if (this.props.required) {
      return (
        <input
          type={this.props.type}
          className="text_input"
          name={this.props.name}
          id={this.props.id}
          placeholder={this.props.placeholder}
          required
        />
      );
    } else {
      return (
        <input
          type={this.props.type}
          className="text_input"
          name={this.props.name}
          id={this.props.id}
          placeholder={this.props.placeholder}
        />
      );
    }
  }
}

export default TextInput;
