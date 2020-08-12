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
  }

  onClickSearchButton() {
    alert("こーじちゅー");
  }

  render() {
    return (
      <div className="search-form">
        <div className="search-form__title">検索条件</div>
        <div className="search-form__form">
          <table className="search-form__form__table">
            <tr>
              <td>年度</td>
              <td className="search-form__form__table__input">
                <TextInput id="year" type="number" />
              </td>
            </tr>
            <tr>
              <td>日付</td>
              <td className="search-form__form__table__input">
                <DateInput id="date1" /> 〜 <DateInput id="date2" />
              </td>
            </tr>
            <tr>
              <td>市町村</td>
              <td className="search-form__form__table__input">
                <TextInput id="city" type="text" />
              </td>
            </tr>
          </table>
          <div className="search-form__form__button-div">
            <div className="search-form__form__button-div__button">
              <RoundButton bind={this.onClickSearchButton.bind(this)}>
                検索
              </RoundButton>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchForm;
