Feature: Record Rent Payment

  Scenario: Given a lease with one rent charge, When the tenant pays more than is owed, Then the extra is kept as credit and pays towards the next charge.
    Given a lease with one rent charge
    When the tenant pays more than is owed
    Then the extra is kept as credit
    And the credit pays towards the next charge.
