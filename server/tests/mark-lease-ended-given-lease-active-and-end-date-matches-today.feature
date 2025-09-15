Feature: Automation marks lease as ended

  Scenario: Given today matches the scheduled lease end date and the lease is still active, When Automation marks the lease as ended, Then Lease Ended is recorded and the associated turnover moves to awaiting vacancy confirmation.
    Given today matches the scheduled lease end date and the lease is still active
    When Automation marks the lease as ended
    Then Lease Ended is recorded and the associated turnover moves to awaiting vacancy confirmation.