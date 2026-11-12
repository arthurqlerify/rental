Feature: Waive Rent Charge

  Scenario: Given an unpaid rent charge, When the PropertyMgr waives the charge with a reason, Then Rent Charge Waived is recorded with the reason and nothing is owed for the charge.
    Given an unpaid rent charge
    When the PropertyMgr waives the charge with a reason
    Then Rent Charge Waived is recorded with the reason and nothing is owed for the charge.
