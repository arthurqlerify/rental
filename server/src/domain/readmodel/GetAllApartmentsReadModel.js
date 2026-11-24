import db from '../../infrastructure/db/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// The calendar day (UTC) a date falls on, as a count of days since 1970-01-01; undefined when it is no date.
const dayNumber = (value) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? undefined : Math.floor(time / DAY_MS);
};

// The latest time a tenant was recorded as leaving the apartment, from its turnovers.
const lastVacatedAt = (turnovers, apartmentId) =>
  turnovers
    .filter((turnover) => turnover.apartmentId === apartmentId && dayNumber(turnover.vacatedAt) !== undefined)
    .map((turnover) => turnover.vacatedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

class GetAllApartmentsReadModel {
  // Every apartment, with daysEmpty: the whole days an apartment without a tenant has been empty, counted to
  // the server's date (UTC). It is null for an apartment with a tenant (Occupied), and when no date is known.
  // An apartment saved before emptySince was kept counts from the last time its tenant was recorded as leaving.
  static async query() {
    const apartments = await db.findAll('Apartment');
    const turnovers = await db.findAll('Turnover');
    const today = dayNumber(new Date());

    return apartments.map((apartment) => {
      if (apartment.status === 'Occupied') return { ...apartment, daysEmpty: null };

      const emptySinceDay = dayNumber(apartment.emptySince ?? lastVacatedAt(turnovers, apartment.id));
      return { ...apartment, daysEmpty: emptySinceDay === undefined ? null : Math.max(0, today - emptySinceDay) };
    });
  }
}

export default GetAllApartmentsReadModel;
