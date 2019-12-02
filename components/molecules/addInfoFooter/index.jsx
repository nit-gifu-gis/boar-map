import Router from "next/router";
import React from "react";
import LinkButton from "../../atomos/linkButton";

class AddInfoFooter extends React.Component {
  render() {
    return (
      <div className="AddInfoFooter">
        <div className="flex">
          <LinkButton link={this.props.prevLink} title="前へ" />
          <LinkButton link={this.props.nextLink} title="次へ" />
        </div>
      </div>
    );
  }
}

export default AddInfoFooter;
