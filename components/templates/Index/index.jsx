import "./index.scss";
import "../../../public/static/css/global.scss";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import SessionManager from "../../../utils/session";
import Link from "next/link";

const Index = () => (
  <div className="index">
    <div className="image_area">
      <img
        className="image"
        src="static/images/login_image.png"
        alt="いのししマップぎふ"
      ></img>
    </div>
    <div className="title">
      <span>いのしし</span>
      <span>マップ</span>
      <span>ぎふ</span>
    </div>
    <div className="sub_title">
      <span>岐阜県家畜対策公式Webアプリ</span>
    </div>
    <br />
    <div className="sub_title">
      <span>どちらか選択してください</span>
    </div>
    <div className="page_selector">
      <div className="selector_item color_trace">
        <Link href="/trace">
          <a>
            <div className="selector_content">トレーサビリティ システム</div>
          </a>
        </Link>
      </div>
      <div className="selector_item color_map">
        <Link href="/map">
          <a>
            <div className="selector_content">マップ</div>
          </a>
        </Link>
      </div>
    </div>
    <div className="copy_right">
      <span>(c) 2019-2021 National Institute of Technology, </span>
      <span>Gifu College GIS Team</span>
    </div>
  </div>
);

export default Index;
