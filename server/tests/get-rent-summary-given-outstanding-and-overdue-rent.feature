Feature: Get Rent Summary

  Scenario: Given leases with rent outstanding, rent overdue, rent paid up and credit, When the PropertyMgr views the rental overview, Then it shows the total outstanding rent, the total overdue rent and how many leases are overdue.
    Given leases with rent outstanding, rent overdue, rent paid up and credit
    When the PropertyMgr views the rental overview
    Then it shows the total outstanding rent, the total overdue rent and how many leases are overdue.
