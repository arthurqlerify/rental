Feature: Overdue Rent

  Scenario: Given a rent charge that is not fully paid, When 5 days have passed since its due date, Then the charge and its lease are overdue, and were not the day before.
    Given a rent charge that is not fully paid
    When the PropertyMgr views the rent 4 days and 5 days after the charge's due date
    Then the charge and its lease are overdue 5 days after the due date, and were not 4 days after it.

  Scenario: Given a rent charge that has been fully paid, When more than 5 days have passed since its due date, Then the charge and its lease are not overdue.
    Given a rent charge that has been fully paid
    When the PropertyMgr views the rent more than 5 days after the charge's due date
    Then the charge and its lease are not overdue.
