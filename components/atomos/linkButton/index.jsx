import "./linkButton.scss";

import Router from "next/router";
import React from "react";

class LinkButton extends React.Component {
  onClick(e) {
    const link = e.target.value;
    Router.push(link);
  }

  render() {
    return (
      <button
        className="LinkButton"
        value={this.props.link}
        onClick={this.onClick.bind(this)}
      >
        {this.props.title}
      </button>
    );
  }
}

export default LinkButton;
