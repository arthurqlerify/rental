Feature: Waive Rent Charge

  Scenario: Given an unpaid rent charge, When the PropertyMgr waives the charge with a reason, Then Rent Charge Waived is recorded with the reason and nothing is owed for the charge.
    Given an unpaid rent charge
    When the PropertyMgr waives the charge with a reason
    Then Rent Charge Waived is recorded with the reason and nothing is owed for the charge.

  Scenario: Given an unpaid rent charge, When the PropertyMgr waives the charge without a reason, Then the request is refused and the charge is still owed.
    Given an unpaid rent charge
    When the PropertyMgr waives the charge without a reason
    Then the request is refused and the charge is still owed.

  Scenario: Given a rent charge that is partly paid, When the PropertyMgr waives the charge with a reason, Then nothing is owed for the charge and what was paid towards it is kept as credit.
    Given a rent charge that is partly paid
    When the PropertyMgr waives the charge with a reason
    Then nothing is owed for the charge and what was paid towards it is kept as credit.
