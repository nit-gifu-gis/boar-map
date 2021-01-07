import "./infoTypeSelector.scss";
import Router from "next/router";
import React from "react";
import InfoTypeItem from "../../molecules/InfoTypeItem";
import UserData from "../../../utils/userData";

const BoarDiv = () => (
  <div className="boar-div select-div">
    <input type="radio" id="radio1" name="infoType" value="boar" />
    <label htmlFor="radio1" className="label">
      <InfoTypeItem
        src="../static/images/icons/boar.svg"
        alt="いのししアイコン"
        text="捕獲情報"
      />
    </label>
  </div>
);

const TrapDiv = () => (
  <div className="trap-div select-div">
    <input type="radio" id="radio2" name="infoType" value="trap" />
    <label htmlFor="radio2" className="label">
      <InfoTypeItem
        src="../static/images/icons/trap.svg"
        alt="わなアイコン"
        text="わな情報"
      />
    </label>
  </div>
);

const VaccineDiv = () => (
  <div className="vaccine-div select-div">
    <input type="radio" id="radio3" name="infoType" value="vaccine" />
    <label htmlFor="radio3" className="label">
      <InfoTypeItem
        src="../static/images/icons/vaccine.svg"
        alt="ワクチンアイコン"
        text="ワクチン情報"
      />
    </label>
  </div>
);

class InfoTypeSelector extends React.Component {
  constructor() {
    super();
    this.state = {
      userData: UserData.getUserData(),
      selected: []
    };
  }

  getSelectedItem() {
    // フォーム取得
    const infoTypeSelect = document.form.infoType;
    let checkedItem = null;
    for (let i = 0; i < infoTypeSelect.length; i++) {
      if (infoTypeSelect[i].checked) {
        checkedItem = infoTypeSelect[i].value;
        break;
      }
    }
    return checkedItem;
  }

  render() {
    let choices = [];

    if (this.state.userData) {
      // userDepartmentに応じて表示するものを変更する
      switch (this.state.userData.department) {
        case "T":
        case "U":
        case "S":
        case "R":
          choices = [<BoarDiv />, <TrapDiv />];
          break;
        case "W":
          choices = [<VaccineDiv />];
          break;
        case "K":
          choices = [<BoarDiv />, <TrapDiv />, <VaccineDiv />];
          break;
        default:
          choices = [];
          break;
      }
    }

    return (
      <div className="info-type-selector">
        <div className="description">
          <p>情報の種類を選択してください。</p>
        </div>
        <div className="choices">
          <form name="form">
            <div className="radio">{choices}</div>
            <input
              type="radio"
              id="radio4"
              name="infoType"
              value="none"
              style={{ display: "none" }}
            />
          </form>
        </div>
      </div>
    );
  }
}

export default InfoTypeSelector;
