Feature: Record Rent Payment

  Scenario: Given a lease with two unpaid rent charges, When the PropertyMgr records a payment that covers more than the oldest charge, Then the oldest charge is paid in full and the rest of the payment goes to the next charge.
    Given a lease with two unpaid rent charges
    When the PropertyMgr records a payment that covers more than the oldest charge
    Then the oldest charge is paid in full and the rest of the payment goes to the next charge.
