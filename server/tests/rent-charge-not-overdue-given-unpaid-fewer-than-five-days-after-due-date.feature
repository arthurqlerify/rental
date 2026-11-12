Feature: Rent Charge Overdue

  Scenario: Given an unpaid rent charge, When fewer than 5 days have passed since its due date, Then the charge is owed but not yet overdue.
    Given an unpaid rent charge
    When fewer than 5 days have passed since its due date
    Then the charge is owed but not yet overdue.
