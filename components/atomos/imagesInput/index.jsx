import "./imagesInput.scss";
import "../../../utils/statics";
import React from "react";
import RoundButton from "../roundButton";

class ImagesInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onChange: function changed(data) {},
      name: this.props.name,
      objectURLs: []
    };

    if (this.props.onChange != undefined) {
      this.state.onChange = this.props.onChange;
    }

    if (this.props.objectURLs != undefined) {
      this.state.objectURLs = this.props.objectURLs;
    }
  }

  componentDidMount() {}

  makeCompressedImageURL(file) {
    return new Promise((resolve, reject) => {
      if (process.browser) {
        // 圧縮処理
        const imageData = new Image();
        imageData.src = URL.createObjectURL(file);
        imageData.onload = () => {
          // サイズ取得
          const wRow = imageData.width;
          const hRow = imageData.height;
          // 長辺を1024に丸める
          const longSide = wRow > hRow ? wRow : hRow;
          let ratio = 1024.0 / longSide;
          if (ratio > 1.0) ratio = 1.0;
          const w = wRow * ratio;
          const h = hRow * ratio;
          // キャンバスに描画
          const canvas = document.getElementById("canvas");
          const ctx = canvas.getContext("2d");
          canvas.setAttribute("width", w);
          canvas.setAttribute("height", h);
          ctx.drawImage(imageData, 0, 0, w, h);
          // Blobを生成
          if (canvas.msToBlob) {
            // msToBlobが実装されているブラウザ(IE/レガシーEdge)ではこの方法
            // dataURLを生成
            const url = canvas.toDataURL("image/jpeg", 0.5);
            // blobを生成
            const bin = atob(url.replace(/^.*,/, ""));
            const buffer = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) {
              buffer[i] = bin.charCodeAt(i);
            }
            const blob = new Blob([buffer.buffer], { type: "image/png" });
            console.log(blob.size);
            // objectURLを生成
            const objectURL = URL.createObjectURL(blob);
            resolve(objectURL);
          } else {
            // モダンブラウザはcanvasから直接blobが作れる
            canvas.toBlob(
              blob => {
                const objectURL = URL.createObjectURL(blob);
                resolve(objectURL);
              },
              "image/jpeg",
              0.5
            );
          }
        };
        imageData.onerror = e => reject(e);
      } else {
        reject("window is not defined.");
      }
    });
  }

  async formChanged() {
    const input = document.imagesInput__form.file;
    // 10枚以上は登録不可
    if (this.state.objectURLs.length + input.files.length > 10) {
      alert("一度に登録できる画像は10枚までです");
      return;
    }
    // 入力された各画像に関して
    const newURLs = [];
    for (const file of input.files) {
      // 圧縮した画像のobjectURLを受け取る
      const url = await this.makeCompressedImageURL(file);
      // this.makePreview(url);
      // dataURLを配列に入れておく
      newURLs.push(url);
    }
    // stateに反映
    this.setState(state => {
      const newlist = state.objectURLs.concat(newURLs);
      // onChangeを呼ぶ
      this.state.onChange(newlist);
      return {
        objectURLs: newlist
      };
    });
    // this.state.onChange(data);
  }

  // 各画像の上のバツボタンを押したときの処理
  onClickEreseButton(index) {
    if (confirm("この画像の登録を取り消しますか？")) {
      console.log(index);
      console.log(this.state.objectURLs[index]);
      // 押された番号のobjectURLを消す
      this.setState(state => {
        // 引数で受け取ったインデックス以外の要素の配列を作る
        const newlist = state.objectURLs.filter((_, i) => i !== index);
        // 削除する画像のobjectURLをメモリから解放
        URL.revokeObjectURL(this.state.objectURLs[index]);
        // onChangeを呼ぶ
        this.state.onChange(newlist);
        return {
          objectURLs: newlist
        };
      });
    }
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
    // プレビューを描画
    const previewChildren = [];
    for (let i = 0; i < this.state.objectURLs.length; i++) {
      const previewChild = (
        <div className="images-input__preview__child">
          <img
            className="images-input__preview__child__image"
            src={this.state.objectURLs[i]}
          ></img>
          <button
            className="images-input__preview__child__erase-button"
            onClick={this.onClickEreseButton.bind(this, i)}
          >
            ×
          </button>
        </div>
      );
      previewChildren.push(previewChild);
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
        <div className="images-input__preview" id="preview">
          {previewChildren}
        </div>
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
