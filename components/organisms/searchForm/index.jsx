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
      year: null,
      date1: null,
      date2: null,
      city: null,
      onClick: data => {
        console.log(data);
      }
    };
    if (props.onClick != undefined) {
      this.state.onClick = props.onClick;
    }
  }

  onClickSearchButton() {
    const data = {
      year: this.state.year,
      date1: this.state.date1,
      date2: this.state.date2,
      city: this.state.city
    };
    this.state.onClick(data);
    alert("こーじちゅー");
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
                <DateInput id="date1" />
              </div>
              <div className="search-form__form__grid__input__tilda">〜</div>
              <div className="search-form__form__grid__input__date">
                <DateInput id="date2" />
              </div>
            </div>
            <div className="search-form__form__grid__title search-form__form__grid__city">
              市町村
            </div>
            <div className="search-form__form__grid__input search-form__form__grid__city">
              <TextInput id="city" />
            </div>
            <div className="search-form__form__grid__button-div">
              <div className="search-form__form__grid__button-div__button">
                <RoundButton bind={this.onClickSearchButton.bind(this)}>
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
