Feature: Issue Monthly Rent Charges

  Scenario: Given several active leases and a lease that has ended, When the PropertyMgr issues the month's rent charges, Then each active lease is charged its current rent once and the ended lease is not charged.
    Given several active leases and a lease that has ended
    When the PropertyMgr issues the month's rent charges
    Then each active lease is charged its current rent once and the ended lease is not charged.
