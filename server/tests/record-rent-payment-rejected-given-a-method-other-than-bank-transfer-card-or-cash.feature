Feature: Record Rent Payment

  Scenario: Given a lease with an unpaid rent charge, When the PropertyMgr records a payment by a method other than bank transfer, card or cash, Then the request is refused and no payment is recorded.
    Given a lease with an unpaid rent charge
    When the PropertyMgr records a payment by a method other than bank transfer, card or cash
    Then the request is refused and no payment is recorded.
