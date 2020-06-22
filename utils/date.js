compareDate = (date1, date2) => {
  const year1 = date1.getFullYear();
  const month1 = date1.getMonth() + 1;
  const day1 = date1.getDate();

  const year2 = date2.getFullYear();
  const month2 = date2.getMonth() + 1;
  const day2 = date2.getDate();

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
