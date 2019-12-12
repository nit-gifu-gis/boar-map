import Router from "next/router";
import React from "react";
import NextButton from "../../atomos/nextButton";
import PrevButton from "../../atomos/prevButton";

class AddInfoFooter extends React.Component {
  render() {
    return (
      <div className="AddInfoFooter">
        <div className="flex">
          <div className="flex_prev">
            <PrevButton bind={this.props.prevBind} />
          </div>
          <div className="flex_next">
            <NextButton bind={this.props.nextBind} />
          </div>
        </div>
      </div>
    );
  }
}

export default AddInfoFooter;
