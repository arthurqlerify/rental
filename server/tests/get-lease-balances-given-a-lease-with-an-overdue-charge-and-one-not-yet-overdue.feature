Feature: Get All Lease Balances

  Scenario: Given a lease with an overdue charge and a charge that is not yet overdue, When the PropertyMgr views the lease's balance, Then it shows everything owed and how much of it is overdue.
    Given a lease with an overdue charge and a charge that is not yet overdue
    When the PropertyMgr views the lease's balance
    Then it shows everything owed and how much of it is overdue.
