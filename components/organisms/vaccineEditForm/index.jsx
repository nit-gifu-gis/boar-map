import "./vaccineEditForm.scss";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";
import DateInput from "../../atomos/dateInput";

const RecoverInfoForm = props => (
  <div className="__recover_info_form">
    <div className="__recover_date">
      <label>回収年月日</label>
      <DateInput
        name="recoverDate"
        id="recoverDate"
        date={props["detail"]["properties"]["回収年月日"]}
      />
    </div>
    <div className="eaten">
      <label>摂食の有無</label>
      <select
        name="eaten"
        id="eaten"
        defaultValue={props["detail"]["properties"]["摂食の有無"]}
      >
        <option value="なし">なし</option>
        <option value="あり">あり</option>
      </select>
    </div>
    <div className="damage">
      <label>その他の破損</label>
      <select
        name="damage"
        id="damage"
        defaultValue={props["detail"]["properties"]["その他破損"]}
      >
        <option value="なし">なし</option>
        <option value="あり">あり</option>
      </select>
    </div>
  </div>
);

class VaccineEditForm extends React.Component {
  state = {
    recoverInfoForm: null
  };

  constructor() {
    super();
    // ユーザーデータ取得(cookieから持ってくる)
    const userData = { user_id: "", access_token: "" };
    if (process.browser) {
      const r = document.cookie.split(";");
      r.forEach(function(value) {
        const content = value.split("=");
        content[0] = content[0].replace(" ", "");
        if (content[0] == "user_id") {
          userData.user_id = content[1];
        } else if (content[0] == "access_token") {
          userData.access_token = content[1];
        }
      });
    } else {
      return;
    }
  }

  // 前へボタンを押したときの処理
  onClickPrev() {
    const url = "/detail";
    Router.push(
      {
        pathname: url,
        query: { type: 2, FeatureID: this.props.detail["properties"]["ID$"] }
      },
      url
    );
  }

  // 次へボタンを押したときの処理
  onClickNext() {
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    // 1 位置情報
    const lat = Router.query.lat;
    const lng = Router.query.lng;
    // 2 メッシュ番号
    const meshNumber = form.meshNumber.value;
    // 3 散布年月日
    const treatDate = form.treatDate.value;
    // 4 散布数
    const treatNumber = form.treatNumber.value;
    // 隠し情報 回収済みかどうか
    const recover = form.recover.checked;
    // 5 回収年月日
    let recoverDate = "";
    // 6 摂食の有無
    let eaten = "";
    // 7 その他破損
    let damage = "";
    // 8 破損なし
    // 多分構成ミスなので無し
    // 9 備考
    const note = form.note.value;
    if (recover) {
      recoverDate = form.recoverDate.value;
      eaten = form.eaten.options[form.eaten.selectedIndex].value;
      damage = form.damage.options[form.damage.selectedIndex].value;
    }
    // 確認画面に遷移
    const url = "/edit/confirm/vaccine";
    Router.push(
      {
        pathname: url,
        query: {
          id: this.props.detail["properties"]["ID$"],
          type: 2,
          lat: this.props.detail["geometry"]["coordinates"][1],
          lng: this.props.detail["geometry"]["coordinates"][0],
          meshNumber: meshNumber,
          treatDate: treatDate,
          treatNumber: treatNumber,
          recover: recover,
          recoverDate: recoverDate,
          eaten: eaten,
          damage: damage,
          note: note
        }
      },
      url
    );
  }

  // 回収が変更されたときに呼ばれる
  onChangeRecover() {
    const recoverChecked = document.forms.form.recover.checked;
    if (recoverChecked) {
      this.setState(_ => {
        return { recoverInfoForm: <RecoverInfoForm /> };
      });
    } else {
      this.setState(_ => {
        return { recoverInfoForm: null };
      });
    }
  }

  render() {
    let recoverCheckBox = (
      <input
        type="checkbox"
        name="recover"
        id="recover"
        onChange={this.onChangeRecover.bind(this)}
      />
    );
    if (this.props.detail["properties"]["回収年月日"] != "") {
      this.state.recoverInfoForm = (
        <RecoverInfoForm detail={this.props.detail} />
      );
      recoverCheckBox = (
        <input
          type="checkbox"
          name="recover"
          id="recover"
          onChange={this.onChangeRecover.bind(this)}
          defaultChecked
        />
      );
    }
    return (
      <div className="vaccineForm">
        <div className="__title">
          <h1>ワクチン情報</h1>
        </div>
        <div className="__description">
          <p>各情報を入力してください。</p>
        </div>
        <div className="__form">
          <p>
            位置情報確認：({this.props.detail["geometry"]["coordinates"][1]},{" "}
            {this.props.detail["geometry"]["coordinates"][0]})
          </p>
          <form name="form">
            <div className="__mesh_number">
              <label>メッシュ番号</label>
              <input
                type="number"
                name="meshNumber"
                id="meshNumber"
                min="0"
                defaultValue={this.props.detail["properties"]["メッシュ番号"]}
              />
            </div>
            <div className="__treat_date">
              <label>散布年月日</label>
              <DateInput
                name="treatDate"
                id="treatDate"
                date={this.props.detail["properties"]["散布年月日"]}
              />
            </div>
            <div className="__treat_number">
              <label>散布数</label>
              <input
                type="number"
                name="treatNumber"
                id="treatNumber"
                min="1"
                defaultValue={this.props.detail["properties"]["散布数"]}
              />
            </div>
            <div className="__recover">
              <label>回収</label>
              {recoverCheckBox}
            </div>
            {this.state.recoverInfoForm}
            <div className="note">
              <label>備考</label>
              <textarea
                rows="4"
                cols="50"
                name="note"
                id="note"
                defaultValue={this.props.detail["properties"]["備考"]}
              />
            </div>
          </form>
        </div>
        <AddInfoFooter
          prevBind={this.onClickPrev.bind(this)}
          nextBind={this.onClickNext.bind(this)}
        />
      </div>
    );
  }
}

export default VaccineEditForm;
