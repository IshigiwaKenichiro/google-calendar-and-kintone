const converters = {
    /**
     * 
     * @param {GoogleAppsScript.Calendar.CalendarEvent} ev 
     * @param {GoogleAppsScript.Calendar.Calendar} cal
     */
    event2create(ev, cal) {
        return {
            "eventId": {
                "value": ev.getId()
            },
            "タイトル": {
                "value": ev.getTitle()
            },
            "開始日時": {
                "value": ev.getStartTime().toISOString()
            },
            "終了日時": {
                "value": ev.getEndTime().toISOString()
            },
            "備考": {
                "value": [
                    ev.getDescription(),
                    ...ev.getGuestList().map(g => g.getEmail())
                ].join('\n')
            },
            "イベントURL": {
                value: getCalenderEventLink(cal.getId(), ev)
            },
            "連携日時" : {
                value : new Date().toISOString()
            }
        }
    },
    /**
     * 
     * @param {GoogleAppsScript.Calendar.CalendarEvent} ev 
     * @param {string} id 
     * @param {GoogleAppsScript.Calendar.Calendar} cal
     */
    event2update(ev, id, cal) {
        return {
            id,
            record: {
                "eventId": {
                    "value": ev.getId()
                },
                "タイトル": {
                    "value": ev.getTitle()
                },
                "開始日時": {
                    "value": ev.getStartTime().toISOString()
                },
                "終了日時": {
                    "value": ev.getEndTime().toISOString()
                },
                "備考": {
                    "value": [
                        ev.getDescription(),
                        ...ev.getGuestList().map(g => g.getEmail())
                    ].join('\n')
                },
                "イベントURL": {
                    value: getCalenderEventLink(cal.getId(), ev)
                },
                "連携日時" : {
                    value : new Date().toISOString()
                }
            }
        }
    },


}
function getCalenderEventLink(calendarId, calendarEvent) {
    const baseUrl = 'https://www.google.com/calendar/event?eid=';
    const splitEventId = calendarEvent.getId().split('@');
    const eventUrl = `${baseUrl}${Utilities.base64Encode(splitEventId[0] + ' ' + calendarId)}`;
    return eventUrl;
}