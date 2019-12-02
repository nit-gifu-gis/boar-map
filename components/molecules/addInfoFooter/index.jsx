import Router from "next/router";
import React from "react";
import NextButton from "../../atomos/nextButton";
import PrevButton from "../../atomos/prevButton";

class AddInfoFooter extends React.Component {
  render() {
    return (
      <div className="AddInfoFooter">
        <div className="flex">
          <PrevButton bind={this.props.prevBind} />
          <NextButton bind={this.props.nextBind} />
        </div>
      </div>
    );
  }
}

export default AddInfoFooter;
