import "./versionInfo.scss";
import "../../../public/static/css/global.scss";
import React from "react";
import ReactMarkDown from "react-markdown/with-html";

class VersionInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markdown: null,
      latest: null
    };
  }

  componentDidMount() {
    // markdownファイル読み込み
    const rawFile = new XMLHttpRequest();
    let allText = null;
    rawFile.open("GET", "static/history.md", false);
    rawFile.onreadystatechange = () => {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          allText = rawFile.responseText;
          // console.log("allText: ", allText);
          this.setState({
            markdown: allText
          });
        }
      }
    };
    rawFile.send(null);
    // markdownテキストから最新バージョンを取得
    // 一番最初の小見出しが最新バージョン
    const pattern = /^### .+$/m;
    const result = allText.match(pattern);
    const latest = result[0].replace("### ", "");
    console.log(latest);
    this.setState({
      latest: latest
    });
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
          </div>
        </div>
      </div>
    );
  }
}

export default VersionInfo;
