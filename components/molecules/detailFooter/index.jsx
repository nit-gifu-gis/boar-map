import "./detailFooter.scss";
import React from "react";

class DetailFooter extends React.Component {
  render() {
    return (
      <div className="detailFooter">
        <div className="flex">
          <button onClick={this.props.nextHandler}>Edit</button>
        </div>
      </div>
    );
  }
}

export default DetailFooter;
