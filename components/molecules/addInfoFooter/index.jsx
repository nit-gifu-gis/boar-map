import Router from "next/router";
import React from "react";
import LinkButton from "../../atomos/linkButton";

class AddInfoFooter extends React.Component {
  render() {
    return (
      <div className="AddInfoFooter">
        <div className="flex">
          <LinkButton link={this.props.prevLink} title="次へ" />
          <LinkButton link={this.props.nextLink} title="前へ" />
        </div>
      </div>
    );
  }
}

export default AddInfoFooter;
