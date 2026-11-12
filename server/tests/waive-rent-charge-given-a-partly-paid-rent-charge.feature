Feature: Waive Rent Charge

  Scenario: Given a rent charge that is partly paid, When the PropertyMgr waives the charge with a reason, Then nothing is owed for the charge and what was paid towards it is kept as credit.
    Given a rent charge that is partly paid
    When the PropertyMgr waives the charge with a reason
    Then nothing is owed for the charge and what was paid towards it is kept as credit.
