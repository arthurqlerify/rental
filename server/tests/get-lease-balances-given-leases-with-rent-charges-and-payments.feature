Feature: Get All Lease Balances

  Scenario: Given a lease with an overdue charge and a charge that is not yet overdue, When the PropertyMgr views the lease's balance, Then it shows everything owed and how much of it is overdue.
    Given a lease with an overdue charge and a charge that is not yet overdue
    When the PropertyMgr views the lease's balance
    Then it shows everything owed and how much of it is overdue.

  Scenario: Given a lease that has paid more than it was charged, When the PropertyMgr views the lease's balance, Then it shows nothing owed and the extra as credit.
    Given a lease that has paid more than it was charged
    When the PropertyMgr views the lease's balance
    Then it shows nothing owed and the extra as credit.

  Scenario: Given leases in a property that are paid up, owing and overdue, When the PropertyMgr views the lease balances for the property, Then every lease has a balance and the overdue lease is listed first and marked overdue.
    Given leases in a property that are paid up, owing and overdue
    When the PropertyMgr views the lease balances for the property
    Then every lease has a balance and the overdue lease is listed first and marked overdue.
