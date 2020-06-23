compareDate = (date1, date2) => {
  const year1 = date1.getFullYear();
  const month1 = date1.getMonth() + 1;
  const day1 = date1.getDate();

  const year2 = date2.getFullYear();
  const month2 = date2.getMonth() + 1;
  const day2 = date2.getDate();

  console.log(year1, year2);

  if (year1 === year2) {
    if (month1 === month2) {
      if (day1 === day2) {
        return 0;
      } else {
        if (day1 > day2) {
          return 1;
        } else {
          return -1;
        }
      }
    } else {
      if (month1 > month2) {
        return 1;
      } else {
        return -1;
      }
    }
  } else {
    if (year1 > year2) {
      return 1;
    } else {
      return -1;
    }
  }
};

ignoreInvalidDate = dateString => {
  // 不正な日付は今日にする
  let date = new Date(dateString);
  if (date.toString() === "Invalid Date") {
    date = new Date();
  }
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
};

checkDateError = dateString => {
  const date = new Date(dateString);
  // 不正な日付
  if (date.toString() === "Invalid Date") {
    return "日付が入力されていません。";
  }
  // 今日の日付
  const today = new Date();
  if (compareDate(date, today) > 0) {
    // 未来の日付だったら不正
    return "未来の日付が入力されています。";
  }
  return null;
};

checkNumberError = numString => {
  if (numString == "") {
    return "入力されていません。";
  }
  const num = Number(numString);
  if (Number.isNaN(num)) {
    return "数値以外が入力されています。";
  }
  return null;
};
