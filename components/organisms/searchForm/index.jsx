import "./searchForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import RoundButton from "../../atomos/roundButton";
import TextInput from "../../atomos/textInput";
import DateInput from "../../atomos/dateInput";

class SearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dateErr: false,
      onClick: data => {}
    };
    if (props.onClick != undefined) {
      this.state.onClick = props.onClick;
    }
  }

  onChangeCities(id) {
    const value = document.getElementById(id).value;
    console.log(value);
    // 市町村はスペース区切りで配列化
    if (id === "cities") {
      const tmpArr = value.split(/[\s\n,\.，．、。]/);
      // 空白の配列は削除
      const arr = tmpArr.filter(e => e !== "");
      console.log(arr);
      this.state[id] = arr;
    } else {
      this.state[id] = value;
    }
  }

  validateDate(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (d1 <= d2) {
      this.setState({ dateErr: false });
      return true;
    } else {
      this.setState({ dateErr: true });
    }
  }

  onClickSearchButton() {
    const date1 = document.getElementById("date1").value;
    const date2 = document.getElementById("date2").value;
    if (!this.validateDate(date1, date2)) {
      alert("日付の前後が間違っています。");
      return;
    }
    const citiesStr = document.getElementById("cities").value;
    // 市町村はスペース（等）区切りをカンマ区切りに直す
    const cities = citiesStr.split(/[\s\n,\.，．、。]/).filter(e => e !== "");
    // ファイルを取得しておく
    const userList = document.getElementById("userList").files;
    const data = new FormData();
    data.append("fromDate", date1);
    data.append("toDate", date2);
    data.append("cities", cities);
    if (userList.length !== 0) {
      data.append("userList", userList[0]);
    }
    // 親に通知
    this.state.onClick(data);
  }

  render() {
    return (
      <div className="search-form">
        <div className="search-form__title">検索条件</div>
        <div className="search-form__form">
          <div className="search-form__form__grid">
            <div className="search-form__form__grid__title search-form__form__grid__date">
              日付
            </div>
            <div className="search-form__form__grid__input search-form__form__grid__date">
              <div className="search-form__form__grid__input__date">
                <DateInput id="date1" error={this.state.dateErr} />
              </div>
              <div className="search-form__form__grid__input__tilda">〜</div>
              <div className="search-form__form__grid__input__date">
                <DateInput id="date2" error={this.state.dateErr} />
              </div>
            </div>
            <div className="search-form__form__grid__title search-form__form__grid__city">
              市町村
            </div>
            <div className="search-form__form__grid__input search-form__form__grid__city">
              <TextInput id="cities" />
            </div>
            <div className="search-form__form__grid__title search-form__form__grid__user-list">
              名前一覧表
            </div>
            <div className="search-form__form__grid__input search-form__form__grid__user-list">
              <input
                type="file"
                name="userList"
                id="userList"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
            </div>
            <div className="search-form__form__grid__button-div">
              <div className="search-form__form__grid__button-div__button">
                <RoundButton
                  bind={this.onClickSearchButton.bind(this)}
                  enabled={!this.props.searching}
                >
                  検索
                </RoundButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchForm;
