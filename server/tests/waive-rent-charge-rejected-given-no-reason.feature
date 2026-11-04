Feature: Waive Rent Charge

  Scenario: Given an unpaid rent charge, When the PropertyMgr waives the charge without a reason, Then the request is refused and the charge is still owed.
    Given an unpaid rent charge
    When the PropertyMgr waives the charge without a reason
    Then the request is refused and the charge is still owed.
