Feature: Issue Monthly Rent Charges

  Scenario: Given a lease that starts during the month, When the PropertyMgr issues the month's rent charges, Then the lease is charged only for the days from its start date, due on that date.
    Given a lease that starts during the month
    When the PropertyMgr issues the month's rent charges
    Then the lease is charged only for the days from its start date, due on that date.
