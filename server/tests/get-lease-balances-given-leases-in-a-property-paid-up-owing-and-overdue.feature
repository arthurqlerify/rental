Feature: Get All Lease Balances

  Scenario: Given leases in a property that are paid up, owing and overdue, When the PropertyMgr views the lease balances for the property, Then every lease has a balance and the overdue lease is listed first and marked overdue.
    Given leases in a property that are paid up, owing and overdue
    When the PropertyMgr views the lease balances for the property
    Then every lease has a balance and the overdue lease is listed first and marked overdue.
