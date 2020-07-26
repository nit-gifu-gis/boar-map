import "./imagesInput.scss";
import "../../../utils/statics";
import React from "react";
import RoundButton from "../roundButton";

class ImagesInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onChange: function changed(data) {}
    };

    if (this.props.onChange != undefined) {
      this.state.onChange = this.props.onChange;
    }
  }

  componentDidMount() {}

  postImage(callback) {
    if (!hasFile) {
      callback([], null);
    }
  }

  makeCompressedImageURL(file) {
    return new Promise((resolve, reject) => {
      if (process.browser) {
        // 圧縮処理
        const imageData = new Image();
        imageData.src = URL.createObjectURL(file);
        imageData.onload = () => {
          // サイズ取得
          const w = imageData.width;
          const h = imageData.height;
          // キャンバスに描画
          const canvas = document.getElementById("canvas");
          const ctx = canvas.getContext("2d");
          canvas.setAttribute("width", w);
          canvas.setAttribute("height", h);
          ctx.drawImage(imageData, 0, 0);
          // dataURLを生成
          const url = canvas.toDataURL("image/jpeg", 0.5);
          resolve(url);
        };
        imageData.onerror = e => reject(e);
      } else {
        reject("window is not defined.");
      }
    });
  }

  async formChanged() {
    const input = document.imagesInput__form.file;
    const preview = document.getElementById("preview");
    for (const file of input.files) {
      // 圧縮した画像のdataURLを受け取る
      const url = await this.makeCompressedImageURL(file);
      // sessionStorageに置く

      // プレビューにも表示
      const img = document.createElement("img");
      img.setAttribute("class", "images-input__preview__image");
      img.setAttribute("src", url);
      preview.appendChild(img);
    }
    // this.state.onChange(data);
  }

  onClickButton() {
    const input = document.imagesInput__form.file;
    input.click();
  }

  render() {
    let className = "images-input";
    if (this.props.error) {
      className += "--error";
    }
    return (
      <div className={className}>
        <form name="imagesInput__form" className="images-input__form">
          <input
            type="file"
            name="file"
            id="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={this.formChanged.bind(this)}
            style={{ display: "none" }}
          />
        </form>
        <div className="images-input__preview" id="preview"></div>
        <canvas className="images-input__canvas" id="canvas"></canvas>
        <div className="images-input__buttonDiv">
          <RoundButton color="primary" bind={this.onClickButton}>
            画像を選択
          </RoundButton>
        </div>
      </div>
    );
  }
}

export default ImagesInput;
