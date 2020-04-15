// 定数一覧

IMAGE_SERVER_URI = "https://api-gis-dev.junki-t.net";

BOAR_LAYER_ID = 5000008;
TRAP_LAYER_ID = 5000009;
VACCINE_LAYER_ID = 5000010;

getColorCode = colorText => {
  let colorCode = "#ff9800";
  switch (colorText) {
    case "primary":
      colorCode = "#ff9800";
      break;
    case "accent":
      colorCode = "#536dfe";
      break;
    case "danger":
      colorCode = "#ff0000";
      break;
    case "boar":
      colorCode = "#842929";
      break;
    case "trap":
      colorCode = "#fbc02d";
      break;
    case "vaccine":
      colorCode = "#0288d1";
      break;
    default:
      break;
  }
  return colorCode;
};
