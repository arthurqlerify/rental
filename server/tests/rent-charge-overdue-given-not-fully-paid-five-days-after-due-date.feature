Feature: Rent Charge Overdue

  Scenario: Given a rent charge that is only partly paid, When 5 days have passed since its due date, Then the charge is overdue and so is the rest still owed on the lease.
    Given a rent charge that is only partly paid
    When 5 days have passed since its due date
    Then the charge is overdue and so is the rest still owed on the lease.

  Scenario: Given an unpaid rent charge, When fewer than 5 days have passed since its due date, Then the charge is owed but not yet overdue.
    Given an unpaid rent charge
    When fewer than 5 days have passed since its due date
    Then the charge is owed but not yet overdue.

  Scenario: Given a rent charge that was paid in full after its due date, When more than 5 days have passed since its due date, Then the charge is not overdue.
    Given a rent charge that was paid in full after its due date
    When more than 5 days have passed since its due date
    Then the charge is not overdue.
