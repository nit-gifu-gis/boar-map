import "./versionInfo.scss";
import "../../../public/static/css/global.scss";
import React from "react";
import ReactMarkDown from "react-markdown/with-html";
import { getVersionInfomation } from "../../../utils/versioninfo";

class VersionInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markdown: null,
      latest: null
    };
  }

  async componentDidMount() {
    // バージョン情報を取得する
    try {
      const version = await getVersionInfomation();
      this.setState({
        markdown: version.allText,
        latest: version.latestNumber
      });
    } catch (e) {
      console.error("Login: get version error:", e);
    }
  }

  render() {
    return (
      <div className="version-info">
        <div className="version version-info-contents">{this.state.latest}</div>
        <div className="logo version-info-contents">
          <img
            src="static/images/team_logo.png"
            alt="岐阜高専GIS開発部"
            height="100"
          />
        </div>
        <div className="description version-info-contents">
          このアプリケーションは岐阜高専GIS開発部が開発しています。
        </div>
        <div className="history version-info-contents">
          <div className="history-title">更新履歴</div>
          <div className="history-contents">
            <ReactMarkDown source={this.state.markdown} escapeHtml={false} />
            <div className="footer-adjust"></div>
          </div>
        </div>
      </div>
    );
  }
}

export default VersionInfo;
