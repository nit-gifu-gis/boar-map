import "./detail.scss";
import Router from "next/router";

import BoarInfo from "../../organisms/boarInfo";
import TrapInfo from "../../organisms/trapInfo";
import VaccineInfo from "../../organisms/vaccineInfo";

import DetailHeader from "../../molecules/detailHeader";
import DetailFooter from "../../molecules/detailFooter";

class Detail extends React.Component {
  state = {
    detail: {},
    retry: 0
  };
  async getFeatureDetail() {
    retry++;
    if (Router.query.type == undefined) {
      Router.push("/map");
      return;
    }
    const userData = { user_id: "", access_token: "" };
    const r = document.cookie.split(";");
    r.forEach(function(value) {
      const content = value.split("=");
      content[0] = content[0].replace(" ", "");
      if (content[0] == "user_id") {
        userData.user_id = content[1];
      } else if (content[0] == "access_token") {
        userData.access_token = content[1];
      }
    });

    const receiptNumber = Math.floor(Math.random() * 100000);
    const data = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: 5000008 + parseInt(Router.query.type),
      shapeIds: [1],
      srid: 3857
    };

    fetch(
      "https://pascali.info-mapping.com/webservices/publicservice/JsonService.asmx/GetFeaturesById",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Map-Api-Access-Token": userData.access_token
        },
        body: JSON.stringify(data)
      }
    )
      .then(res => {
        res
          .json()
          .then(rdata => {
            retry = 0;
            if (rdata["data"]["features"].length != 0) {
              const feature = rdata["data"]["features"][0];
              this.setState({ detail: feature });
            }
          })
          .catch(e => {
            if (this.state <= 5) {
              this.getFeatureDetail();
            }
          });
      })
      .catch(e => {
        if (this.state <= 5) {
          this.getFeatureDetail();
        }
      });
  }

  componentDidMount() {
    this.getFeatureDetail();
  }

  render() {
    let detaildiv = <h1>情報取得中...</h1>;
    if (Object.keys(this.state.detail).length != 0) {
      const type = Router.query.type;
      if (type == 0) {
        detaildiv = <BoarInfo detail={this.state.detail} />;
      } else if (type == 1) {
        detaildiv = <TrapInfo detail={this.state.detail} />;
      } else if (type == 2) {
        detaildiv = <VaccineInfo detail={this.state.detail} />;
      }
    }
    return (
      <div>
        <DetailHeader />
        {detaildiv}
        <DetailFooter />
      </div>
    );
  }
}

export default Detail;
