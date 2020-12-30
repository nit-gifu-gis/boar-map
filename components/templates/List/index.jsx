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
    this.onClickExport.bind(this);
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
      console.log(features);
      if (features.length === 0) {
        alert("データが1件も見つかりませんでした。");
        this.setState({
          searched: false,
          searching: false
        });
        return;
      }
      const images = await this.fetchImages(features);
      console.log(images);
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
    const options = {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data"
      },
      mode: "cors",
      credentials: "include"
    };
    delete options.headers["Content-Type"];

    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`${SERVER_URI}/BoarList/GetList.php`, options);
        const json = await res.json();
        if (res.status === 200) {
          const list = json["features"];
          resolve(list);
        } else {
          const reason = json["reason"];
          reject(reason);
        }
      } catch (error) {
        reject(error);
      }
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
        img.src = `${SERVER_URI}/Image/GetImage.php?id=${id}`;
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

  async onClickExport() {
    const req_body = {
      features: this.state.features
    };

    try {
      const res = await fetch(`${SERVER_URI}/BoarList/Export.php`, {
        method: "POST",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Type": "application/json"
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify(req_body)
      });
      if (res.status === 200) {
        const blob = await res.blob();
        const anchor = document.createElement("a");
        const now = new Date();
        const yyyy = ("0000" + now.getFullYear()).slice(-4);
        const mm = ("00" + (now.getMonth() + 1)).slice(-2);
        const dd = ("00" + now.getDate()).slice(-2);
        const name = "捕獲情報一覧表(" + yyyy + "-" + mm + "-" + dd + ").xlsx";
        // IE対応
        if (window.navigator.msSaveBlob) {
          window.navigator.msSaveBlob(blob, name);
          return;
        }
        anchor.download = name;
        anchor.href = window.URL.createObjectURL(blob);
        anchor.click();
      } else {
        const json = await res.json();
        alert(json["reason"]);
      }
    } catch (error) {
      alert(error);
    }
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
            onClick={this.onClickExport.bind(this)}
          />
          <div className="list__contents__footer-adjuster"></div>
        </div>
      </div>
    );
  }
}

export default List;
