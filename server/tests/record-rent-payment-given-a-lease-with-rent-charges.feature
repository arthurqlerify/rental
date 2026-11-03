Feature: Record Rent Payment

  Scenario: Given a lease with unpaid rent charges for two months, When the PropertyMgr records a payment that covers less than what is owed, Then the payment pays the oldest unpaid charge first and the rest is still owed.
    Given a lease with unpaid rent charges for two months
    When the PropertyMgr records a payment that covers less than what is owed
    Then the payment pays the oldest unpaid charge first and the rest is still owed.

  Scenario: Given a lease with an unpaid rent charge, When the PropertyMgr records a payment beyond what is owed, Then the extra is kept as credit and pays the next charge when it is issued.
    Given a lease with an unpaid rent charge
    When the PropertyMgr records a payment beyond what is owed
    Then the extra is kept as credit and pays the next charge when it is issued.

  Scenario: Given a lease, When the PropertyMgr records a payment with a method other than bank transfer, card or cash or with an amount that is not positive, Then the payment is refused and nothing is recorded.
    Given a lease
    When the PropertyMgr records a payment with a method other than bank transfer, card or cash or with an amount that is not positive
    Then the payment is refused and nothing is recorded.
