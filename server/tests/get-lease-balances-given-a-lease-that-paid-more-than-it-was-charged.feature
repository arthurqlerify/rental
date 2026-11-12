Feature: Get All Lease Balances

  Scenario: Given a lease that has paid more than it was charged, When the PropertyMgr views the lease's balance, Then it shows nothing owed and the extra as credit.
    Given a lease that has paid more than it was charged
    When the PropertyMgr views the lease's balance
    Then it shows nothing owed and the extra as credit.
