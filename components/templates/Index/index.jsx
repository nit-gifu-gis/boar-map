import "./index.scss";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import SessionManager from "../../../utils/session";
import Link from "next/link";

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
