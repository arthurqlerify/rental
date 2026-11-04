Feature: Rent Charge Overdue

  Scenario: Given a rent charge that is only partly paid, When 5 days have passed since its due date, Then the charge is overdue and so is the rest still owed on the lease.
    Given a rent charge that is only partly paid
    When 5 days have passed since its due date
    Then the charge is overdue and so is the rest still owed on the lease.
