import "./vaccineForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import InfoInput from "../../molecules/infoInput";
import AddInfoFooter from "../../molecules/addInfoFooter";
import DateInput from "../../atomos/dateInput";

const RecoverInfoForm = () => (
  <div>
    <InfoInput title="回収年月日" type="date" name="recoverDate" />
    {/* <div className="__date __recover_date">
      <label>回収年月日</label>
      <p></p>
      <DateInput name="recoverDate" id="recoverDate" />
    </div> */}
    <InfoInput
      title="摂食の有無"
      type="select"
      name="eaten"
      options={["なし", "あり"]}
    />
    {/* <div className="__form __eaten">
      <label>摂食の有無</label>
      <p></p>
      <select name="eaten" id="eaten">
        <option value="なし">なし</option>
        <option value="あり">あり</option>
      </select>
    </div> */}
    <InfoInput
      title="その他の破損"
      type="select"
      name="damage"
      options={["なし", "あり"]}
    />
    {/* <div className="__form __damage">
      <label>その他の破損</label>
      <p></p>
      <select name="damage" id="damage">
        <option value="なし">なし</option>
        <option value="あり">あり</option>
      </select>
    </div> */}
  </div>
);

class VaccineForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recover: false,
      recoverInfoForm: null,
      lat: null,
      lng: null,
      userData: null
    };
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
      this.state.userData = userData;
    } else {
      return;
    }
  }

  componentDidMount() {
    if (Router.query.lat != undefined && Router.query.lng != undefined) {
      this.setState({
        lat: Router.query.lat,
        lng: Router.query.lng
      });
    } else {
      Router.push("/map");
    }
  }

  // データを作る
  createData() {
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    const user = this.state.userData.user_id;
    // 1 位置情報
    const lat = this.state.lat;
    const lng = this.state.lng;
    // 2 メッシュ番号
    const meshNumber = form.meshNumber.value;
    // 3 散布年月日
    const treatDate = form.treatDate.value;
    // 4 散布数
    const treatNumber = form.treatNumber.value;
    // 隠し情報 回収済みかどうか
    const recover = this.state.recover;
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

    // [todo] ここにバリデーション [todo]

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      properties: {
        入力者: user,
        位置情報: "(" + lat + "," + lng + ")",
        メッシュ番号: meshNumber,
        散布年月日: treatDate,
        散布数: treatNumber,
        回収年月日: recoverDate,
        摂食の有無: eaten,
        その他破損: damage,
        備考: note
      }
    };
  }

  // 次へボタンを押したときの処理
  onClickNext() {
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    // 1 位置情報
    const lat = this.state.lat;
    const lng = this.state.lng;
    // 2 メッシュ番号
    const meshNumber = form.meshNumber.value;
    // 3 散布年月日
    const treatDate = form.treatDate.value;
    // 4 散布数
    const treatNumber = form.treatNumber.value;
    // 隠し情報 回収済みかどうか
    const recover = this.state.recover;
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
    const url = "/add/confirm/vaccine";
    Router.push(
      {
        pathname: url,
        query: {
          lat: lat,
          lng: lng,
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
    const recoverSelect = document.forms.form.recover;
    const recover = recoverSelect.options[recoverSelect.selectedIndex].value;
    if (recover == "回収済") {
      this.setState(_ => {
        return { recoverInfoForm: <RecoverInfoForm />, recover: true };
      });
    } else {
      this.setState(_ => {
        return { recoverInfoForm: null, recover: false };
      });
    }
  }

  onSubmit(e) {
    // エンターキーで送信されるのを防ぐ
    e.preventDefault();
  }

  render() {
    if (this.state.lng != undefined && this.state.lat != undefined) {
      return (
        <div className="vaccine-form">
          <div className="form">
            <form name="form" onSubmit={this.onSubmit}>
              <InfoInput
                title="メッシュ番号"
                type="number"
                name="meshNumber"
                min="0"
              />
              {/* <div className="__number __mesh_number">
                <label>メッシュ番号</label>
                <p></p>
                <input
                  type="number"
                  name="meshNumber"
                  id="meshNumber"
                  min="0"
                />
              </div> */}
              <InfoInput title="散布年月日" type="date" name="treatDate" />
              {/* <div className="__date __treat_date">
                <label>散布年月日</label>
                <p></p>
                <DateInput name="treatDate" id="treatDate" />
              </div> */}
              <InfoInput
                title="散布数"
                type="number"
                name="treatNumber"
                min="1"
              />
              {/* <div className="__number __treat_number">
                <label>散布数</label>
                <p></p>
                <input
                  type="number"
                  name="treatNumber"
                  id="treatNumber"
                  min="1"
                />
              </div> */}
              <InfoInput
                title="回収状況"
                type="select"
                name="recover"
                onChange={this.onChangeRecover.bind(this)}
                options={["未回収", "回収済"]}
              />
              {/* <div className="__check __recover">
                <label>
                  回収
                  <p></p>
                  <input
                    type="checkbox"
                    name="recover"
                    id="recover"
                    onChange={this.onChangeRecover.bind(this)}
                  />
                  <span></span>
                </label>
              </div> */}
              {this.state.recoverInfoForm}
              <InfoInput title="備考" type="text-area" rows="4" name="note" />
              {/* <div className="__textarea note">
                <label>備考</label>
                <p></p>
                <textarea rows="4" cols="50" name="note" id="note" />
              </div> */}
            </form>
          </div>
          {/* <AddInfoFooter
            prevBind={this.onClickPrev}
            nextBind={this.onClickNext.bind(this)}
          /> */}
        </div>
      );
    } else {
      return (
        <div className="vaccineForm">
          <h1>情報取得中</h1>
        </div>
      );
    }
  }
}

export default VaccineForm;
