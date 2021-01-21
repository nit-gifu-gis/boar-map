import React from "react";
import "./imagesDiv.scss";
import "../../../public/static/css/global.scss";
import "../../../utils/statics";
import { SERVER_URI } from "../../../utils/gis";

class ImagesDiv extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: props.type,
      objectURLs: props.objectURLs !== undefined ? props.objectURLs : [],
      imageIDs: props.imageIDs !== undefined ? props.imageIDs : [],
      confirmMode: props.confirmMode !== undefined ? props.confirmMode : false
    };
  }

  render() {
    let description = null;
    let imgs = [];
    let className = "";

    // プレビュー時
    if (this.state.confirmMode) {
      const len = this.state.objectURLs.length + this.state.imageIDs.length;
      if (len === 0) {
        // アップロードされる画像が0枚
        description = (
          <div className="imagesDiv__description">画像は登録されません。</div>
        );
      } else {
        // アップロードされる画像が1枚以上
        // 1枚とそれ以外でクラス名が変わる
        if (len === 1) {
          className = "imagesDiv__singleBox";
        } else {
          className = "imagesDiv__multiBox";
        }
        // 説明文とimg要素
        description = (
          <div className="imagesDiv__description">
            {len}枚の画像が登録されます。
          </div>
        );
        // サーバー上の画像
        const simgs = this.state.imageIDs.map(data => {
          const url = `${SERVER_URI}/Image/GetImage?id=${data}`;
          return (
            <img src={url} className="imagesDiv__multiBox__image" alt={data} />
          );
        });
        // ローカルの画像
        const limgs = this.state.objectURLs.map(data => {
          const url = `${data}`;
          return <img src={url} className={`${className}__image`} />;
        });
        imgs = simgs.concat(limgs);
      }
    } else {
      if (this.state.type != null) {
        // 通常表示
        const len = this.props.imageIDs.length;
        if (len === 0) {
          // 画像登録なし
          description = (
            <div className="imagesDiv__noImageDescription">
              画像が登録されていません。
            </div>
          );
        } else {
          // 1枚とそれ以外でクラス名が変わる
          if (len === 1) {
            className = "imagesDiv__singleBox";
          } else {
            className = "imagesDiv__multiBox";
          }
          imgs = this.state.imageIDs.map(data => {
            const url = `${SERVER_URI}/Image/GetImage?id=${data}`;
            return (
              <img
                src={url}
                className="imagesDiv__multiBox__image"
                alt={data}
              />
            );
          });
        }
      }
    }

    return (
      <div className="imagesDiv">
        {description}
        <div className={className}>{imgs}</div>
      </div>
    );
  }
}

export default ImagesDiv;
