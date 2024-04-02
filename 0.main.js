function main() {
  const period = {
    start: new Date(),
    end: new Date()
  }
  period.end.setFullYear(new Date().getFullYear() + 3);

  const { errors, lastUpdated } = accessor.getLastUpdated();

  if (0 < errors.length) {
    libs.log(errors);
    return;
  }
  
  const eventsOnCalendar = libs.getEvents(period);
  const {records : recordsOnPeriod, errors : pRecordsErrors} = accessor.getRecordsOnPeriod({ ...period, startField: '開始日時', endField: '終了日時' });
  errors.push(...pRecordsErrors);

  if (0 < errors.length) {
    libs.log(errors);
    return;
  }
  
  const events = eventsOnCalendar.filter(e => e.getLastUpdated().getTime() > lastUpdated.getTime());

  const creaters = [];
  const updaters = [];
  const deleters = [];

  for (let ev of events) {
    const rec = recordsOnPeriod.find(rec => rec['eventId'].value == ev.getId());

    if (null == rec) {
      creaters.push(converters.event2create(ev, cal));
    } else {
      updaters.push(converters.event2update(ev, rec.$id.value, cal))
    }
  }

  const recordsDeleted = recordsOnPeriod.filter(rec => !eventsOnCalendar.some(ev => ev.getId() == rec['eventId'].value));
  deleters.push(...recordsDeleted.map(rec => rec['eventId'].value));

  libs.log({ updaters, creaters , deleters});

  accessor.updateRecords(updaters);
  accessor.createRecords(creaters);
  accessor.deleteRecords(recordsDeleted.map(rec => rec.$id.value));

  libs.log(`${creaters.length} records created. ${updaters.length} records updated. ${deleters.length} records deleted.`);

  libs.log('job finished.');
}
