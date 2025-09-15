Feature: Schedule Lease End
  Scenario: Given an active lease for the apartment and a confirmed termination date, When the PropertyMgr schedules the lease end for that date, Then Lease End Scheduled is recorded with leaseId, apartmentId and endDate and next-step notifications are queued.
    Given an active lease for the apartment and a confirmed termination date
    When the PropertyMgr schedules the lease end for that date
    Then Lease End Scheduled is recorded with leaseId, apartmentId and endDate and next-step notifications are queued.