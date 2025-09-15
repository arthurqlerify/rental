import db from '../../infrastructure/db/index.js';

class MarkLeaseEndedCommand {
  static async execute({ id, apartmentId, endDate, moveOutConfirmedAt, turnoverId, nextActorEmail }) {
    // 1. Fetch the Lease
    const lease = await db.findById('Lease', id);

    if (!lease) {
      throw new Error('Lease not found.');
    }

    // 2. Validate GWT conditions
    // "Given today matches the scheduled lease end date"
    // Assuming 'endDate' from the request body represents 'today' for automation check.
    const requestEndDateStr = new Date(endDate).toISOString().split('T')[0];
    const leaseScheduledEndDateStr = new Date(lease.endDate).toISOString().split('T')[0];

    if (requestEndDateStr !== leaseScheduledEndDateStr) {
      throw new Error('Lease cannot be marked ended: scheduled end date mismatch.');
    }

    // "and the lease is still active," (i.e., not already marked as moved out)
    if (lease.moveOutConfirmedAt) {
      throw new Error('Lease is already marked as ended.');
    }

    // 3. Update the Lease
    // "Then Lease Ended is recorded"
    const updatedLease = await db.update('Lease', id, {
      moveOutConfirmedAt: moveOutConfirmedAt, // Use the moveOutConfirmedAt value from the request body
    });

    // 4. Handle Turnover update (skipped due to OpenAPI constraint)
    // The GWT description "and the associated turnover moves to awaiting vacancy confirmation"
    // implies an update to the Turnover entity. However, the OpenAPI specification
    // does not define a schema for Turnover, nor does it provide fields related to
    // a 'status' that could be set to 'awaiting vacancy confirmation'.
    // Adhering strictly to OpenAPI as the source of truth, this part of the business
    // logic cannot be implemented without explicit schema definitions.

    return updatedLease;
  }
}

export default MarkLeaseEndedCommand;