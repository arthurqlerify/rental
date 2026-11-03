Feature: Waive Rent Charge

  Scenario: Given a rent charge with rent owed, When the PropertyMgr waives the charge with a reason, Then the charge is waived with the reason and nothing is owed for it.
    Given a rent charge with rent owed
    When the PropertyMgr waives the charge with a reason
    Then the charge is waived with the reason and nothing is owed for it.

  Scenario: Given a rent charge with rent owed, When the PropertyMgr waives the charge without a reason, Then the request is refused and the rent is still owed.
    Given a rent charge with rent owed
    When the PropertyMgr waives the charge without a reason
    Then the request is refused and the rent is still owed.

  Scenario: Given a rent charge that has been fully paid, When the PropertyMgr waives the charge, Then the request is refused because nothing is owed for it.
    Given a rent charge that has been fully paid
    When the PropertyMgr waives the charge
    Then the request is refused because nothing is owed for it.
