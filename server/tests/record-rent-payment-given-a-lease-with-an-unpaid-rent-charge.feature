Feature: Record Rent Payment

  Scenario: Given a lease with an unpaid rent charge, When the PropertyMgr records a part payment by bank transfer, Then Rent Payment Recorded is stored with the amount, date paid and method, and the rest of the charge is still owed.
    Given a lease with an unpaid rent charge
    When the PropertyMgr records a part payment by bank transfer
    Then Rent Payment Recorded is stored with the amount, date paid and method, and the rest of the charge is still owed.
