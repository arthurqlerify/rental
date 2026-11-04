Feature: Get All Rent Charges and Payments

  Scenario: Given rent charges and payments for leases in two properties, When the PropertyMgr narrows the rent list to one property, Then only that property's charges and payments are listed.
    Given rent charges and payments for leases in two properties
    When the PropertyMgr narrows the rent list to one property
    Then only that property's charges and payments are listed.
