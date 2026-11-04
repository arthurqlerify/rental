Feature: Charge Rent

  Scenario: Given a lease that has already been charged for the month, When the PropertyMgr charges the same month again, Then the request is refused and the lease still has one charge for the month.
    Given a lease that has already been charged for the month
    When the PropertyMgr charges the same month again
    Then the request is refused and the lease still has one charge for the month.
