Feature: Rent Charge Overdue

  Scenario: Given a rent charge that was paid in full after its due date, When more than 5 days have passed since its due date, Then the charge is not overdue.
    Given a rent charge that was paid in full after its due date
    When more than 5 days have passed since its due date
    Then the charge is not overdue.
