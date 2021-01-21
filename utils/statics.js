// 定数一覧

MAX_UPLOAD_SIZE = 20 * (1024 * 1024);

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
