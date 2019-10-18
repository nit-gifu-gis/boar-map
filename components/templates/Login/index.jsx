import "./login.scss";
import Link from "next/link";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";

const Login = () => (
  <div>
    <Header />
    <h1>Login Page Content!</h1>
    <Link href="/">
      <a>トップページへのリンク</a>
    </Link>
    <Footer />
  </div>
);

export default Login;
