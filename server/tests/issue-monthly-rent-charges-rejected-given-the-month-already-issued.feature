Feature: Issue Monthly Rent Charges

  Scenario: Given the month's rent charges have already been issued, When the PropertyMgr issues the month's rent charges again, Then the request is refused and no lease is charged twice for the month.
    Given the month's rent charges have already been issued
    When the PropertyMgr issues the month's rent charges again
    Then the request is refused and no lease is charged twice for the month.
