import "./index.scss";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import SessionManager from "../../../utils/session";
import Link from "next/link";
import GoogleMapReact from "google-map-react";

/**
 * https://qiita.com/miyabiya/items/98c8a177e6077ee50971
 * Google Maps使うのはここに参考するといいかも
 * (GoogleMapReactはpackageに追加済みです)
 */

const Index = () => (
  <div>
    <Header />
    <h1>Hello World!</h1>
    <Link href="#">
      <a onClick={OnLogout}>ログアウト</a>
    </Link>
    <br />
    <Link href="/map">
      <a>マップ</a>
    </Link>
    <Footer />
  </div>
);

const OnLogout = e => {
  SessionManager.logout(document);
};

export default Index;
