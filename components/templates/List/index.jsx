import "./list.scss";

import React from "react";
import Router from "next/router";
import Header from "../../organisms/header";
import UserData from "../../../utils/userData";
import SearchForm from "../../organisms/searchForm";
import ListTable from "../../organisms/listTable";
import "../../../utils/statics";

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: UserData.getUserData(),
      features: [],
      searching: false,
      searched: false,
      images: []
    };
    this.onClickSearch.bind(this);
  }

  componentDidMount() {
    // 権限がない人はアクセス不可
    const department = this.state.userData.department;
    if (department !== "K") {
      Router.push("./map");
    }
  }

  // 検索ボタンが押された時
  async onClickSearch(data) {
    // console.log("Search data", data);
    this.setState({ searching: true });
    try {
      const features = await this.getFeatures(data);
      const images = await this.fetchImages(features);
      // console.log(imagesSize);
      this.setState({
        features: features,
        images: images,
        searched: true,
        searching: false
      });
    } catch (error) {
      alert(`エラーが発生しました．\n${error}`);
      this.setState({ searching: false });
    }
  }

  getFeatures(data) {
    const token = this.state.userData.access_token;
    const receiptNumber = Math.floor(Math.random() * 100000);
    // 今はまだイノシシだけでいい
    const layerId = BOAR_LAYER_ID;

    const date1 = data.date1;
    const date2 = data.date2;
    const cities = data.cities;

    // console.log(date1, date2, cities);

    // 条件を作る
    const combination = []; // 0=and 1=or
    const fieldName = []; // フィールド名を入れていく
    const searchValue = []; // 値を入れていく
    const operators = []; // 0=等しい 1=以上 2=以下 3=超える 4=未満 5=等しくない 6=部分一致 7=前方一致 8=後方一致

    // date1より捕獲年月日が後
    combination.push(0);
    fieldName.push("捕獲年月日");
    searchValue.push(date1);
    operators.push(1);

    // date2より捕獲年月日が前
    combination.push(0);
    fieldName.push("捕獲年月日");
    searchValue.push(date2);
    operators.push(2);

    // citiesがメッシュ番号の中に含まれている
    let flag = true;
    for (const city of cities) {
      if (flag) {
        combination.push(0);
        flag = false;
      } else {
        combination.push(1);
      }
      fieldName.push("メッシュ番号");
      searchValue.push(city);
      operators.push(6);
    }

    // リクエストに必要なデータを作る
    const reqBody = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: layerId,
      srid: 4326,
      combination: combination,
      fieldName: fieldName,
      searchValue: searchValue,
      operators: operators
    };
    // console.log(reqBody);

    return new Promise(async (resolve, reject) => {
      // リクエストを送信
      const res = await fetch("/api/JsonService.asmx/GetFeaturesByAttribute", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Map-Api-Access-Token": token
        },
        body: JSON.stringify(reqBody)
      });
      // サーバーエラーなら落ちる
      if (!res.ok) {
        const text = await res.text();
        console.error("Error 500", text);
        reject(text);
        return;
      }
      const json = await res.json();
      if (json.commonHeader.resultInfomation !== "0") {
        reject(json.commonHeader.systemErrorReport);
        return;
      }
      if (json.data.features == null) {
        reject("features is not found");
        return;
      }
      resolve(json.data.features);
    });
  }

  // 画像のサイズを先回りで取得しておく
  async fetchImages(features) {
    const fetchImage = id => {
      return new Promise(resolve => {
        if (id === "") {
          resolve();
          return;
        }
        const img = new Image();
        img.onload = () => {
          resolve({
            id: id,
            w: img.width,
            h: img.height
          });
        };
        img.src = `${IMAGE_SERVER_URI}/view.php?type=${"boar"}&id=${id}`;
      });
    };

    return await Promise.all(
      features.map(async feature => {
        const id = feature["properties"]["ID$"];
        const ids = feature["properties"]["画像ID"];
        if (ids == "") {
          return {
            id: id,
            images: []
          };
        }
        const images = await Promise.all(
          ids.split(",").map(id => fetchImage(id))
        );
        return {
          id: id,
          images: images
        };
      })
    );
  }

  render() {
    return (
      <div className="list">
        <Header color="primary">一覧表</Header>
        <div className="list__contents">
          <SearchForm
            onClick={this.onClickSearch.bind(this)}
            searching={this.state.searching}
          />
          <ListTable
            searched={this.state.searched}
            features={this.state.features}
            images={this.state.images}
          />
          <div className="list__contents__footer-adjuster"></div>
        </div>
      </div>
    );
  }
}

export default List;
