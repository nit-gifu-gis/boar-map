import React from "react";
import "./selectInput.scss";
import "../../../public/static/css/global.scss";

class SelectInput extends React.Component {
  render() {
    let className = "select-input-div__select-input";
    if (this.props.error) {
      className += "--error";
    }

    const options = [];
    if (this.props.options == undefined) {
      return <></>;
    }
    if (!Array.isArray(this.props.options)) {
      return <></>;
    }

    // console.log("test", this.props.options);
    // jsのfor-inは要素が順番に取り出されるとは限らないらしい…
    for (let i = 0; i < this.props.options.length; i++) {
      // console.log(this.props.options[i]);
      if (this.props.options[i] === this.props.defaultValue) {
        const o = (
          <option
            value={this.props.options[i]}
            key={this.props.options[i]}
            selected
          >
            {this.props.options[i]}
          </option>
        );
        options.push(o);
      } else {
        const o = (
          <option value={this.props.options[i]} key={this.props.options[i]}>
            {this.props.options[i]}
          </option>
        );
        options.push(o);
      }
    }

    // console.log(options);

    return (
      <div className="select-input-div">
        <div className={className}>
          <select
            name={this.props.name}
            id={this.props.id}
            onChange={this.props.onChange}
          >
            {options}
          </select>
        </div>
      </div>
    );
  }
}

export default SelectInput;
