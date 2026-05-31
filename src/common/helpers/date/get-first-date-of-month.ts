
function getFirstDayOfMonth(date: Date = new Date()): Date {
    date.setDate(1);
    return date;
}

export default getFirstDayOfMonth;