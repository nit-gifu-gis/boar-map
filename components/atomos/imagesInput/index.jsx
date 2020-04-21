import "./imagesInput.scss";
import "../../../utils/statics";
import React from "react";
import RoundButton from "../roundButton";

class ImagesInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onChanged: function changed(data) {}
    };

    if (this.props.onChanged != undefined) {
      this.state.onChanged = this.props.onChanged;
    }
  }

  postImage(callback) {
    if (!hasFile) {
      callback([], null);
    }
  }

  formChanged() {
    const input = document.imagesInput__form.file;
    const data = new FormData();
    const preview = document.getElementById("preview");
    // 一旦プレビューはリセット
    while (preview.firstChild) {
      preview.removeChild(preview.firstChild);
    }
    data.append("MAX_FILE_SIZE", MAX_UPLOAD_SIZE);
    for (const file of input.files) {
      console.log(file);
      data.append("files[]", file, file.name);
      // プレビューにも表示
      const img = document.createElement("img");
      img.setAttribute("class", "imagesInput__preview__image");
      img.setAttribute("src", window.URL.createObjectURL(file));
      preview.appendChild(img);
    }
    this.state.onChanged(data);
  }

  onClickButton() {
    const input = document.imagesInput__form.file;
    input.click();
  }

  render() {
    return (
      <div className="imagesInput">
        <form name="imagesInput__form" className="imagesInput__form">
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
        <div className="imagesInput__preview" id="preview"></div>
        <div className="imagesInput__buttonDiv">
          <RoundButton color="primary" bind={this.onClickButton}>
            画像を選択
          </RoundButton>
        </div>
      </div>
    );
  }
}

export default ImagesInput;
