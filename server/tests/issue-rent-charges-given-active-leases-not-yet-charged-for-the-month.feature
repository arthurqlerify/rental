Feature: Issue Rent Charges

  Scenario: Given active leases that have not been charged for the month, When the PropertyMgr issues the month's rent charges, Then one charge per active lease is recorded, due on the 1st, for the lease's current rent.
    Given active leases that have not been charged for the month
    When the PropertyMgr issues the month's rent charges
    Then one charge per active lease is recorded, due on the 1st, for the lease's current rent.

  Scenario: Given a lease that starts during the month and a lease that ends during the month, When the PropertyMgr issues the month's rent charges, Then each is charged only for the days it runs and leases that do not run that month are not charged.
    Given a lease that starts during the month and a lease that ends during the month
    When the PropertyMgr issues the month's rent charges
    Then each is charged only for the days it runs and leases that do not run that month are not charged.

  Scenario: Given every active lease has already been charged for the month, When the PropertyMgr issues the month's rent charges again, Then the request is refused and each lease still has one charge for the month.
    Given every active lease has already been charged for the month
    When the PropertyMgr issues the month's rent charges again
    Then the request is refused and each lease still has one charge for the month.

  Scenario: Given one lease has already been charged for the month and a new lease has not, When the PropertyMgr issues the month's rent charges again, Then only the new lease is charged and charging the other lease again is refused.
    Given one lease has already been charged for the month and a new lease has not
    When the PropertyMgr issues the month's rent charges again
    Then only the new lease is charged and charging the other lease again is refused.
