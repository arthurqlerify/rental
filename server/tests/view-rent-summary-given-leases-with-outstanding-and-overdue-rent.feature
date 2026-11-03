Feature: Rent Summary

  Scenario: Given leases with overdue rent and rent that is not yet overdue, When the PropertyMgr views the rent summary, Then it shows the total outstanding rent, the total overdue rent and how many leases are overdue.
    Given leases with overdue rent and rent that is not yet overdue
    When the PropertyMgr views the rent summary
    Then it shows the total outstanding rent, the total overdue rent and how many leases are overdue.
