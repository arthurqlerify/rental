Feature: Charge Rent

  Scenario: Given an active lease that has not been charged for the month, When the PropertyMgr charges the month's rent for the lease, Then Rent Charged is recorded for the lease's current rent, due on the 1st of the month.
    Given an active lease that has not been charged for the month
    When the PropertyMgr charges the month's rent for the lease
    Then Rent Charged is recorded for the lease's current rent, due on the 1st of the month.

  Scenario: Given a lease that has already been charged for the month, When the PropertyMgr charges the same month again, Then the request is refused and the lease still has one charge for the month.
    Given a lease that has already been charged for the month
    When the PropertyMgr charges the same month again
    Then the request is refused and the lease still has one charge for the month.
