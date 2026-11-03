Feature: Get All Rent Charges and Payments

  Scenario: Given rent charges and payments for leases in two properties, When the PropertyMgr narrows the rent list to one property, Then only that property's charges and payments are listed.
    Given rent charges and payments for leases in two properties
    When the PropertyMgr narrows the rent list to one property
    Then only that property's charges and payments are listed.

  Scenario: Given rent charges and payments for leases in two properties, When the PropertyMgr narrows the rent list to one lease, Then only that lease's charges and payments are listed.
    Given rent charges and payments for leases in two properties
    When the PropertyMgr narrows the rent list to one lease
    Then only that lease's charges and payments are listed.

  Scenario: Given rent charges and payments for leases in two properties, When the PropertyMgr views the whole rent list, Then every charge and payment is listed with overdue charges and overdue leases first.
    Given rent charges and payments for leases in two properties
    When the PropertyMgr views the whole rent list
    Then every charge and payment is listed with overdue charges and overdue leases first.
