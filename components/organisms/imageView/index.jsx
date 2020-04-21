import "./imageView.scss";
import "../../../utils/statics";

class ImageView extends React.Component {
  render() {
    if (this.props.type != null) {
      return (
        <div className="imageView">
          <hr />
          <h1 className="imageView__title">登録された画像</h1>
          <div className="imageView__box">
            {this.props.imgs.map(data => {
              const url = `${IMAGE_SERVER_URI}/view.php?type=${this.props.type}&id=${data}`;
              return (
                <img src={url} className="imageView__box__image" alt={data} />
              );
            })}
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default ImageView;
