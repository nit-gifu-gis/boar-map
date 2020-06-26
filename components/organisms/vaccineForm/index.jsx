import "./vaccineForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import InfoInput from "../../molecules/infoInput";
import UserData from "../../../utils/userData";

class VaccineForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recover: false,
      lat: props.lat,
      lng: props.lng,
      userData: UserData.getUserData(),
      error: {
        meshNo: null,
        treatDate: null,
        treatNumber: null,
        recoverDate: null,
        eatenNumber: null,
        damageNumber: null,
        noDamageNumber: null,
        lostNumber: null
      }
    };
    // データが与えられた場合は保存しておく
    if (props.detail != null) {
      this.state.detail = props.detail;
    }
    this.updateError.bind(this);
    this.validateMeshNo.bind(this);
    this.validateEachDate.bind(this);
    this.validateTreatNumber.bind(this);
    this.validateEachNumber.bind(this);
    this.validateDates.bind(this);
    this.validateNumbers.bind(this);
    this.validateDetail.bind(this);
  }

  componentDidMount() {
    // W, K以外は登録不可
    const userDepartment = this.state.userData.department;
    if (userDepartment != "W" && userDepartment != "K") {
      console.log("Permission Denied: この情報にはアクセスできません");
      Router.push("/map");
      return;
    }
    // detailが与えられた場合
    if (this.state.detail != null) {
      const detail = this.state.detail;
      const recover = detail["properties"]["回収年月日"];
      if (recover) {
        this.setState(_ => {
          return { recover: true };
        });
      } else {
        this.setState(_ => {
          return { recover: false };
        });
      }
    }
  }

  async updateError(key, value) {
    const e = deepClone(this.state.error);
    e[key] = value;
    this.setState({ error: e });
  }

  async validateMeshNo() {
    const form = document.forms.form;
    const meshNo = form.meshNo.value;
    // データが無いならエラー
    if (meshNo === "") {
      await this.updateError("meshNo", "入力されていません。");
    } else {
      await this.updateError("meshNo", null);
    }
  }

  async validateEachDate(name) {
    const form = document.forms.form;
    const dateStr = form[name].value;
    const error = checkDateError(dateStr);
    if (error != null) {
      await this.updateError(name, error);
      return;
    }
    await this.updateError(name, null);
  }

  async validateTreatNumber() {
    const form = document.forms.form;
    const numberStr = form.elements["treatNumber"].value;
    const error = checkNumberError(numberStr);
    if (error != null) {
      await this.updateError("treatNumber", error);
      return;
    }
    const num = parseInt(numberStr);
    if (num <= 0) {
      await this.updateError("treatNumber", "0以下の数値が入力されています。");
      return;
    }
    await this.updateError("treatNumber", null);
  }

  async validateEachNumber(name) {
    const form = document.forms.form;
    const numberStr = form.elements[name].value;
    const error = checkNumberError(numberStr);
    if (error != null) {
      await this.updateError(name, error);
      return;
    }
    const num = parseInt(numberStr);
    if (num < 0) {
      await this.updateError(name, "0未満の数値が入力されています。");
      return;
    }
    await this.updateError(name, null);
  }

  async validateDates() {
    if (!this.state.recover) {
      return;
    }
    if (
      this.state.error.treatDate != null ||
      this.state.error.recoverDate != null
    ) {
      // どっちかがエラーなら確認の必要なし
      return;
    }
    const form = document.forms.form;
    const treatDateStr = form.treatDate.value;
    const recoverDateStr = form.recoverDate.value;
    // 散布年月日 > 回収年月日ならエラー
    if (compareDate(treatDateStr, recoverDateStr) > 0) {
      await this.updateError(
        "recoverDate",
        "散布年月日よりも前の日付が入力されています。"
      );
      return;
    }
    await this.updateError("treatDate", null);
    await this.updateError("removeDate", null);
  }

  async validateNumbers() {
    if (!this.state.recover) {
      return;
    }
    if (
      this.state.error.treatNumber != null ||
      this.state.error.eatenNumber != null ||
      this.state.error.damageNumber != null ||
      this.state.error.noDamageNumber != null ||
      this.state.error.lostNumber != null
    ) {
      // 数値にエラーがあれば確認しない
      return;
    }
    const form = document.forms.form;
    const treatNumber = parseInt(form.treatNumber.value);
    const eatenNumber = parseInt(form.eatenNumber.value);
    const damageNumber = parseInt(form.damageNumber.value);
    const noDamageNumber = parseInt(form.noDamageNumber.value);
    const lostNumber = parseInt(form.lostNumber.value);
    const totalNumber =
      eatenNumber + damageNumber + noDamageNumber + lostNumber;
    if (treatNumber != totalNumber) {
      this.updateError(
        "treatNumber",
        "散布数と回収に係る数の合計が合っていません。"
      );
      this.updateError(
        "eatenNumber",
        "散布数と回収に係る数の合計が合っていません。"
      );
      this.updateError(
        "damageNumber",
        "散布数と回収に係る数の合計が合っていません。"
      );
      this.updateError(
        "noDamageNumber",
        "散布数と回収に係る数の合計が合っていません。"
      );
      this.updateError(
        "lostNumber",
        "散布数と回収に係る数の合計が合っていません。"
      );
    }
  }

  // バリデーションをする
  async validateDetail() {
    // 全部チェックしていく
    await this.validateEachDate("treatDate");
    await this.validateTreatNumber();
    await this.validateMeshNo();
    if (this.state.recover) {
      await this.validateEachDate("recoverDate");
      await this.validateDates();
      await this.validateEachNumber("eatenNumber");
      await this.validateEachNumber("damageNumber");
      await this.validateEachNumber("noDamageNumber");
      await this.validateEachNumber("lostNumber");
      await this.validateNumbers();
    }

    // エラー一覧を表示
    let valid = true;
    Object.keys(this.state.error).forEach(key => {
      if (this.state.error[key] != null) {
        console.error(this.state.error[key]);
        valid = false;
      }
    });
    return valid;
  }

  // データを作る
  createDetail() {
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    const user = this.state.userData.user_id;
    // 1 位置情報
    const lat = this.state.lat;
    const lng = this.state.lng;
    // 2 メッシュ番号
    const meshNo = form.meshNo.value;
    // 3 散布年月日
    const treatDate = form.treatDate.value;
    // 4 散布数
    const treatNumber = form.treatNumber.value;
    // 隠し情報 回収済みかどうか
    const recover = this.state.recover;
    // 5 回収年月日
    let recoverDate = "";
    // 6 摂食数
    let eatenNumber = "";
    // 7 その他の破損数
    let damageNumber = "";
    // 8 破損なし
    let noDamageNumber = "";
    // 8-1 ロスト数
    let lostNumber = "";
    // 9 備考
    const note = form.note.value;
    if (recover) {
      recoverDate = form.recoverDate.value;
      eatenNumber = form.eatenNumber.value;
      damageNumber = form.damageNumber.value;
      noDamageNumber = form.noDamageNumber.value;
      lostNumber = form.lostNumber.value;
    }

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      properties: {
        入力者: user,
        位置情報: "(" + lat + "," + lng + ")",
        メッシュNO: meshNo,
        散布年月日: treatDate,
        散布数: treatNumber,
        回収年月日: recoverDate,
        摂食数: eatenNumber,
        その他の破損数: damageNumber,
        破損なし: noDamageNumber,
        ロスト数: lostNumber,
        備考: note
      }
    };
  }

  // 回収が変更されたときに呼ばれる
  onChangeRecover() {
    const recoverSelect = document.forms.form.recover;
    const recover = recoverSelect.options[recoverSelect.selectedIndex].value;
    if (recover == "回収済") {
      this.setState(_ => {
        return { recover: true };
      });
    } else {
      this.setState(_ => {
        return { recover: false };
      });
    }
  }

  onSubmit(e) {
    // エンターキーで送信されるのを防ぐ
    e.preventDefault();
  }

  render() {
    if (this.state.lng != undefined && this.state.lat != undefined) {
      let recoverInfoForm = null;
      if (this.state.recover) {
        recoverInfoForm = [
          <InfoInput
            title="回収年月日"
            type="date"
            name="recoverDate"
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["回収年月日"]
                : null
            }
            required={true}
            onChange={this.validateEachDate.bind(this, "recoverDate")}
            errorMessage={this.state.error.recoverDate}
          />,
          <InfoInput
            title="いのししの摂食数"
            type="number"
            name="eatenNumber"
            min={0}
            step={1}
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["摂食数"]
                : null
            }
            required={true}
            onChange={this.validateEachNumber.bind(this, "eatenNumber")}
            errorMessage={this.state.error.eatenNumber}
          />,
          <InfoInput
            title="その他の破損数"
            type="number"
            name="damageNumber"
            min={0}
            step={1}
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["その他の破損数"]
                : null
            }
            required={true}
            onChange={this.validateEachNumber.bind(this, "damageNumber")}
            errorMessage={this.state.error.damageNumber}
          />,
          <InfoInput
            title="破損なし"
            type="number"
            name="noDamageNumber"
            min={0}
            step={1}
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["破損なし"]
                : null
            }
            required={true}
            onChange={this.validateEachNumber.bind(this, "noDamageNumber")}
            errorMessage={this.state.error.noDamageNumber}
          />,
          <InfoInput
            title="ロスト数"
            type="number"
            name="lostNumber"
            min={0}
            step={1}
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["ロスト数"]
                : null
            }
            required={true}
            onChange={this.validateEachNumber.bind(this, "lostNumber")}
            errorMessage={this.state.error.lostNumber}
          />
        ];
      }
      return (
        <div className="vaccine-form">
          <div className="form">
            <form name="form" onSubmit={this.onSubmit}>
              <InfoInput
                title="画像"
                type="images"
                onChange={this.props.onChangedImages}
              />
              <InfoInput
                title="メッシュ番号"
                type="mesh-num"
                name="meshNo"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["メッシュNO"]
                    : null
                }
                required={true}
                onChange={this.validateMeshNo.bind(this)}
                errorMessage={this.state.error.meshNo}
              />
              <InfoInput
                title="散布年月日"
                type="date"
                name="treatDate"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["散布年月日"]
                    : null
                }
                required={true}
                onChange={this.validateEachDate.bind(this, "treatDate")}
                errorMessage={this.state.error.treatDate}
              />
              <InfoInput
                title="散布数"
                type="number"
                name="treatNumber"
                min="1"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["散布数"]
                    : null
                }
                onChange={this.validateTreatNumber.bind(this)}
                errorMessage={this.state.error.treatNumber}
                required={true}
              />
              <InfoInput
                title="回収状況"
                type="select"
                name="recover"
                onChange={this.onChangeRecover.bind(this)}
                options={["未回収", "回収済"]}
                defaultValue={this.state.recover ? "回収済" : "未回収"}
              />
              {recoverInfoForm}
              <InfoInput
                title="備考"
                type="text-area"
                rows="4"
                name="note"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["備考"]
                    : null
                }
              />
            </form>
          </div>
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
