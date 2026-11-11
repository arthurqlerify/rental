Feature: Automation marks lease as ended

  Scenario: Given the lease is still active and today comes after its scheduled end date, When Automation marks the lease as ended, Then no Lease Ended is recorded and the lease stays active.
    Given the lease is still active and today comes after its scheduled end date
    When Automation marks the lease as ended
    Then no Lease Ended is recorded and the lease stays active.
