
const book = SpreadsheetApp.openByUrl(env.logBookUrl);
let sheet = book.getSheets()[0];
const cal = CalendarApp.getCalendarById(env.calId);


const libs = {
  log(obj) {
    console.log(obj);

    if (null == sheet) {
      sheet = book.insertSheet();
      sheet.setName('log');
    }

    const rowMax = sheet.getLastRow();

    if (rowMax > 1000) {
      sheet.deleteRow(1)
    }

    sheet.appendRow([
      Utilities.formatDate(new Date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss'),
      null == obj ? '' :
        obj instanceof Error ? obj.stack :
          obj instanceof Object ? JSON.stringify(obj, null, '\t') : obj
    ])

  },


  getEvents({start, end}){
    return cal.getEvents(start,end);
  }

}


