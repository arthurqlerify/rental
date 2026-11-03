Feature: Record Rent Payment

  Scenario: Given a lease with an unpaid rent charge, When the PropertyMgr records a part payment by bank transfer, Then Rent Payment Recorded is stored with the amount, date paid and method, and the rest of the charge is still owed.
    Given a lease with an unpaid rent charge
    When the PropertyMgr records a part payment by bank transfer
    Then Rent Payment Recorded is stored with the amount, date paid and method, and the rest of the charge is still owed.

  Scenario: Given a lease with two unpaid rent charges, When the PropertyMgr records a payment that covers more than the oldest charge, Then the oldest charge is paid in full and the rest of the payment goes to the next charge.
    Given a lease with two unpaid rent charges
    When the PropertyMgr records a payment that covers more than the oldest charge
    Then the oldest charge is paid in full and the rest of the payment goes to the next charge.

  Scenario: Given a lease with one rent charge, When the tenant pays more than is owed, Then the extra is kept as credit and pays towards the next charge.
    Given a lease with one rent charge
    When the tenant pays more than is owed
    Then the extra is kept as credit
    And the credit pays towards the next charge.

  Scenario: Given a lease with an unpaid rent charge, When the PropertyMgr records a payment by a method other than bank transfer, card or cash, Then the request is refused and no payment is recorded.
    Given a lease with an unpaid rent charge
    When the PropertyMgr records a payment by a method other than bank transfer, card or cash
    Then the request is refused and no payment is recorded.
