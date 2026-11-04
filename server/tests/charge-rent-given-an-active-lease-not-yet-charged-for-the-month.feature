Feature: Charge Rent

  Scenario: Given an active lease that has not been charged for the month, When the PropertyMgr charges the month's rent for the lease, Then Rent Charged is recorded for the lease's current rent, due on the 1st of the month.
    Given an active lease that has not been charged for the month
    When the PropertyMgr charges the month's rent for the lease
    Then Rent Charged is recorded for the lease's current rent, due on the 1st of the month.
