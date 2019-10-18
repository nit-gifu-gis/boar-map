import "./index.scss";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";

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
    <h1>Index Content!</h1>
    <Link href="/login">
      <a>ログインページへのリンク</a>
    </Link>
    <Footer />
  </div>
);

export default Index;
