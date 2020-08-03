import React from "react";
import "./imagesDiv.scss";
import "../../../public/static/css/global.scss";
import "../../../utils/statics";

class ImagesDiv extends React.Component {
  render() {
    // 確認画面用（暫定処置）
    if (this.props.waitingPublish != null) {
      const imgNum = this.props.waitingPublish;
      if (imgNum <= 0) {
        return (
          <div className="imagesDiv">
            <div className="imagesDiv__description">画像は登録されません。</div>
          </div>
        );
      } else {
        let className = "";
        if (imgNum == 1) {
          className = "imagesDiv__singleBox";
        } else {
          className = "imagesDiv__multiBox";
        }
        let imgBox = null;
        if (this.props.imgs != null) {
          imgBox = (
            <div className={className}>
              {this.props.imgs.map(data => {
                const url = `${data}`;
                return <img src={url} className={`${className}__image`} />;
              })}
            </div>
          );
        }
        return (
          <div className="imagesDiv">
            <div className="imagesDiv__description">
              {imgNum}枚の画像がアップロードされます。
            </div>
            {imgBox}
          </div>
        );
      }
    } else if (this.props.type != null) {
      const imgNum = this.props.imgs.length;
      if (imgNum <= 0) {
        return (
          <div className="imagesDiv">
            <div className="imagesDiv__noImageDescription">
              画像が登録されていません。
            </div>
          </div>
        );
      } else if (imgNum == 1) {
        return (
          <div className="imagesDiv">
            <div className="imagesDiv__singleBox">
              {this.props.imgs.map(data => {
                const url = `${IMAGE_SERVER_URI}/view.php?type=${this.props.type}&id=${data}`;
                return (
                  <img
                    src={url}
                    className="imagesDiv__singleBox__image"
                    alt={data}
                  />
                );
              })}
            </div>
          </div>
        );
      } else {
        return (
          <div className="imagesDiv">
            <div className="imagesDiv__multiBox">
              {this.props.imgs.map(data => {
                const url = `${IMAGE_SERVER_URI}/view.php?type=${this.props.type}&id=${data}`;
                return (
                  <img
                    src={url}
                    className="imagesDiv__multiBox__image"
                    alt={data}
                  />
                );
              })}
            </div>
          </div>
        );
      }
    } else {
      return <></>;
    }
  }
}

export default ImagesDiv;
