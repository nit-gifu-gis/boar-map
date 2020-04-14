import "./trapInfo.scss";
import React from "react";
import InfoDiv from "../../molecules/infoDiv";

class TrapInfo extends React.Component {
  state = {
    removeDateDiv: null
  };
  render() {
    let removediv = undefined;
    if (this.props.detail["properties"]["撤去年月日"] != "") {
      removediv = (
        <InfoDiv
          title="撤去年月日"
          type="date"
          data={this.props.detail["properties"]["撤去年月日"]}
        />
      );
    }
    return (
      <div className="trap_info_form">
        <InfoDiv
          title="場所"
          type="location"
          data={{
            lat: this.props.detail["geometry"]["coordinates"][1],
            lng: this.props.detail["geometry"]["coordinates"][0]
          }}
        />
        <InfoDiv
          title="設置年月日"
          type="date"
          data={this.props.detail["properties"]["設置年月日"]}
        />
        <InfoDiv
          title="わなの種類"
          type="text"
          data={this.props.detail["properties"]["罠の種類"]}
        />
        <InfoDiv
          title="捕獲の有無"
          type="text"
          data={this.props.detail["properties"]["捕獲の有無"]}
        />
        {removediv}
      </div>
    );
  }
}

export default TrapInfo;
