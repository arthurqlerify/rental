import db from '../../infrastructure/db/index.js';
import Lease from '../entity/Lease.js';

class ScheduleLeaseEndCommand {
  static async execute({ id, apartmentId, endDate, noticeDate, currentRent, nextActorEmail }) {
    // Given an active lease for the apartment
    const existingLease = await db.findById('Lease', id);

    if (!existingLease) {
      throw new Error('Lease not found.');
    }

    // When the PropertyMgr schedules the lease end for that date
    // Then Lease End Scheduled is recorded with leaseId, apartmentId and endDate
    // and next-step notifications are queued.
    const updates = {
      apartmentId,
      endDate,
      noticeDate,
      currentRent,
      nextActorEmail,
    };

    const updatedLease = await db.update('Lease', id, updates);

    if (!updatedLease) {
      throw new Error('Failed to schedule lease end.');
    }

    // "next-step notifications are queued." - This is an acknowledged side-effect
    // that would typically involve a separate messaging or notification service.
    // It is not implemented here as per scope rules.

    return updatedLease;
  }
}

export default ScheduleLeaseEndCommand;