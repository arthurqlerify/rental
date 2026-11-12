Feature: Automation marks lease as ended

  Scenario: Given the lease is still active and its scheduled end date has already passed, When Automation marks the lease as ended, Then Lease Ended is recorded.
    Given the lease is still active and its scheduled end date has already passed
    When Automation marks the lease as ended
    Then Lease Ended is recorded.
