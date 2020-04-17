import "./imageInput.scss";
import "../../../utils/statics";

class ImageInput extends React.Component {
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
    const input = document.imageinput__form.file;
    const data = new FormData();
    data.append("MAX_FILE_SIZE", MAX_UPLOAD_SIZE);
    for (const file of input.files) {
      data.append("files[]", file, file.name);
    }
    this.state.onChanged(data);
  }

  render() {
    if (this.props.type != undefined) {
      return (
        <div className="imageinput">
          <h1 className="imageinput__title">写真の添付</h1>
          <form name="imageinput__form" className="imageinput__form">
            <input
              type="file"
              name="file"
              id="file"
              accept="image/png,image/jpeg"
              multiple
              onChange={this.formChanged.bind(this)}
            />
          </form>
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default ImageInput;
