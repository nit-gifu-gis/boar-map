import { ButanetsuView } from "@/types/butanetsuView";
import {
  BoarCommonFeatureV2,
  BoarFeatureV1,
  ButanetsuFeature,
  FeatureBase,
  layerType,
  ReportFeature,
  TrapFeature,
  VaccineFeature,
  YoutonFeature,
} from "@/types/features";
import L from "leaflet";
import { Dispatch, SetStateAction } from "react";

/* Links */
const boarIconLink = "/static/images/icons/boar.svg";
const trapIconLink = {
  box: "/static/images/icons/trap-box.svg",
  tie: "/static/images/icons/trap-tie.svg",
  gun: "/static/images/icons/trap-gun.svg",
};
const vaccineIconLink = "/static/images/icons/vaccine.svg";
const youtonIconLink = "/static/images/icons/youton.png";
const butanetsuIconLink = "/static/images/icons/butanetsu.png";
const reportIconLink = "/static/images/icons/report.png";

/* 関数まとめ */
const formatDate = (date: string) => {
  const regex = new RegExp("(\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}).*", "g");
  const result = regex.exec(date);
  if (result == null) return "日付登録なし";
  else return result[1];
};

/* マーカーの作成 */
const makeCircleMarkers = async (
  radius: number,
  features: ButanetsuFeature[],
): Promise<L.Circle[]> => {
  const l: L.Circle[] = [];
  features.forEach((feature) => {
    const loc = [
      feature.geometry.coordinates[1],
      feature.geometry.coordinates[0],
    ] as L.LatLngExpression;
    const markers = L.circle(loc, {
      radius: radius * 1000,
      color: "#e33b3b",
      weight: 2,
      fill: true,
      fillColor: "#e33b3b",
      fillOpacity: 0.05,
      opacity: 0.4,
    });
    l.push(markers);
  });
  return l;
};

const addNewButanetsuMarkers = (
  currentView: ButanetsuView,
  _features: ButanetsuFeature[],
  overlayList: Record<string, L.MarkerClusterGroup | L.LayerGroup>,
  setBLayerID: Dispatch<SetStateAction<number>>,
) => {
  if (!currentView) return;

  const { radius, days, style, origin } = currentView;
  const showDate = new Date(origin);
  showDate.setHours(0);
  showDate.setMinutes(0);
  showDate.setSeconds(0);
  showDate.setDate(showDate.getDate() - days);

  /* 描画条件に合わせたマーカーのフィルタ */
  const features = _features.filter((f) => {
    const date = new Date(f.properties["捕獲年月日"]);
    return showDate <= date && date <= origin;
  });

  const circleMarkers = async () => {
    if (style !== 2) return await makeCircleMarkers(radius, features);
    return [];
  };

  const newMarkers = (): L.Marker<any>[] => {
    if (style !== 3)
      return features.map((f) => makeMarker(f, "豚熱陽性高率エリア"));
    return [];
  };

  setBLayerID((prev) => {
    const l = overlayList["豚熱陽性高率エリア"] as L.LayerGroup;
    const lg = overlayList["豚熱陽性高率エリア"].getLayer(
      prev,
    ) as L.MarkerClusterGroup;
    lg.addLayers(newMarkers());
    circleMarkers().then((markers) => {
      markers.forEach((m) => {
        l.addLayer(m);
      });
    });
    return prev;
  });
};

const markerIcon = (iconUrl: string, label: string) => {
  return L.divIcon({
    iconSize: [0, 0],
    html: `
                <div class="markerDiv">
                    <img src="${iconUrl}" class="markerDiv__img" style="${!iconUrl.toLowerCase().endsWith(".svg") ? "width: 20px;" : ""}" />
                    <div class="markerDiv__title">${label}</div>
                </div>
            `,
  });
};

interface MarkerConfig {
  icon: L.DivIcon | undefined;
  dataLabel: string;
  dataValue: string;
  version?: string;
}
/* アイコンのURLを罠の種類に合わせて返す */
const trapIconURL = (f: TrapFeature) => {
  switch (f.properties["罠の種類"]) {
    case "箱わな":
      return trapIconLink.box;
    case "くくりわな":
    case "囲いわな":
      return trapIconLink.tie;
    case "銃猟":
      return trapIconLink.gun;
    default:
      return trapIconLink.box;
  }
};

const makePopup = (title: string, date: string): HTMLDivElement => {
  // 大枠
  const div = document.createElement("div");
  div.className = "pop-up";

  // タイトル
  const titleDiv = document.createElement("div");
  titleDiv.className = "pop-up__title";
  titleDiv.appendChild(document.createTextNode(title));
  div.appendChild(titleDiv);

  // 日付
  let dateStr = "";
  const regex = new RegExp("(\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}).*", "g");
  const result = regex.exec(date);
  if (result == null) {
    dateStr += "登録されていません。";
  } else {
    dateStr += result[1];
  }
  const dateDiv = document.createElement("div");
  dateDiv.className = "pop-up__date";
  dateDiv.appendChild(document.createTextNode(dateStr));
  div.appendChild(dateDiv);

  return div;
};

const makeMarker = (_f: FeatureBase, typeLabel: layerType) => {
  let markerConfig: MarkerConfig = {
    icon: undefined,
    dataLabel: "",
    dataValue: "",
    version: "",
  };

  switch (typeLabel) {
    case "いのしし捕獲地点": {
      const f = _f as BoarFeatureV1 | BoarCommonFeatureV2;
      markerConfig = {
        icon: markerIcon(boarIconLink, formatDate(f.properties["捕獲年月日"])),
        dataLabel: "捕獲年月日",
        dataValue: f.properties["捕獲年月日"],
        version: `v${f.version}`,
      };
      break;
    }
    case "わな設置地点": {
      const f = _f as TrapFeature;
      markerConfig = {
        icon: markerIcon(trapIconURL(f), f.properties["設置年月日"]),
        dataLabel: "設置年月日",
        dataValue: f.properties["設置年月日"],
      };
    }
    case "ワクチン散布地点": {
      const f = _f as VaccineFeature;
      markerConfig = {
        icon: markerIcon(vaccineIconLink, f.properties["散布年月日"]),
        dataLabel: "散布年月日",
        dataValue: f.properties["散布年月日"],
      };
      break;
    }
    case "作業日報": {
      const f = _f as ReportFeature;
      markerConfig = {
        icon: markerIcon(
          reportIconLink,
          formatDate(f.properties["作業開始時"]),
        ),
        dataLabel: "作業年月日",
        dataValue: f.properties["作業開始時"],
      };
      break;
    }
    case "豚熱陽性高率エリア": {
      const f = _f as ButanetsuFeature;
      markerConfig = {
        icon: markerIcon(
          butanetsuIconLink,
          formatDate(f.properties["捕獲年月日"]),
        ),
        dataLabel: "捕獲年月日",
        dataValue: f.properties["捕獲年月日"],
      };
      break;
    }
    case "養豚場": {
      const f = _f as YoutonFeature;
      markerConfig = {
        icon: markerIcon(youtonIconLink, f.properties["施設名"]),
        dataLabel: "更新年月日",
        dataValue: f.properties["更新日"],
      };
      break;
    }
  }

  const coordinates = _f.geometry.coordinates as number[];
  const lat = coordinates[1];
  const lng = coordinates[0];

  const mapMarker = L.marker([lat, lng], {
    icon: markerConfig.icon,
  });

  mapMarker.bindPopup(
    makePopup(markerConfig.dataLabel, markerConfig.dataValue),
  );

  mapMarker.on("mouseover", () => mapMarker.openPopup());
  mapMarker.on("mouseout", () => mapMarker.closePopup());

  return mapMarker;
};

export { addNewButanetsuMarkers, formatDate, makeCircleMarkers, makeMarker };
