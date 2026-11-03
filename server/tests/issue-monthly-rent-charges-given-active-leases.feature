Feature: Issue Monthly Rent Charges

  Scenario: Given several active leases and a lease that has ended, When the PropertyMgr issues the month's rent charges, Then each active lease is charged its current rent once and the ended lease is not charged.
    Given several active leases and a lease that has ended
    When the PropertyMgr issues the month's rent charges
    Then each active lease is charged its current rent once and the ended lease is not charged.

  Scenario: Given a lease that starts during the month, When the PropertyMgr issues the month's rent charges, Then the lease is charged only for the days from its start date, due on that date.
    Given a lease that starts during the month
    When the PropertyMgr issues the month's rent charges
    Then the lease is charged only for the days from its start date, due on that date.

  Scenario: Given a lease that ends during the month, When the PropertyMgr issues the month's rent charges, Then the lease is charged only for the days up to its end date, due on the 1st.
    Given a lease that ends during the month
    When the PropertyMgr issues the month's rent charges
    Then the lease is charged only for the days up to its end date, due on the 1st.

  Scenario: Given the month's rent charges have already been issued, When the PropertyMgr issues the month's rent charges again, Then the request is refused and no lease is charged twice for the month.
    Given the month's rent charges have already been issued
    When the PropertyMgr issues the month's rent charges again
    Then the request is refused and no lease is charged twice for the month.
