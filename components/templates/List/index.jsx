import "./list.scss";

import React from "react";
import Router from "next/router";
import Header from "../../organisms/header";
import UserData from "../../../utils/userData";
import SearchForm from "../../organisms/searchForm";
import ListTable from "../../organisms/listTable";
import "../../../utils/statics";
import { data } from "autoprefixer";

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: UserData.getUserData()
    };
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
    console.log("Search data", data);
    // this.getFeatures(data);
    const features = await this.getFeaturesTest();
    console.log(features);
  }

  // 検索ができないらしいのでとりあえず暫定
  getFeaturesTest() {
    const token = this.state.userData.access_token;
    const receiptNumber = Math.floor(Math.random() * 100000);
    const layerId = BOAR_LAYER_ID;

    // ひとまず空間検索でごまかす
    const reqBody = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: layerId,
      inclusion: 1,
      buffer: 10,
      srid: 4326,
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [136.676896, 35.364976],
            [136.676896, 35.350836],
            [136.693195, 35.350836],
            [136.693195, 35.364976],
            [136.676896, 35.364976]
          ]
        ]
      }
    };

    return new Promise(async (resolve, reject) => {
      const res = await fetch("/api/JsonService.asmx/GetFeaturesByExtent", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Map-Api-Access-Token": token
        },
        body: JSON.stringify(reqBody)
      });
      if (!res.ok) {
        const text = await res.text();
        console.log("サーバーエラー？", text);
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

  getFeatures(data) {
    const token = this.state.userData.access_token;
    const receiptNumber = Math.floor(Math.random() * 100000);
    // 今はまだイノシシだけでいい
    const layerId = BOAR_LAYER_ID;

    // リクエストに必要なデータを作る
    const reqBody = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: layerId,
      srid: 4326,
      conbination: [1],
      fieldName: ["体長"],
      searchValue: [99],
      operators: [0]
    };
    console.log(reqBody);

    return new Promise(async (resolve, reject) => {
      const res = await fetch("/api/JsonService.asmx/GetFeaturesByAttribute", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Map-Api-Access-Token": token
        },
        body: JSON.stringify(reqBody)
      });
      const json = await res.json();
      console.log(json);
    });
  }

  render() {
    return (
      <div className="list">
        <Header color="primary">一覧表</Header>
        <div className="list__contents">
          <SearchForm onClick={this.onClickSearch.bind(this)} />
          <ListTable />
        </div>
      </div>
    );
  }
}

export default List;
