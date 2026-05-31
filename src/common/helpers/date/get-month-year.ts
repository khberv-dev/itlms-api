function getYearAndMonth(date: Date | string = new Date()) {
  const d = new Date(date);

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1, // chunki JS da 0-11 bo‘ladi
  };
}

export default getYearAndMonth;