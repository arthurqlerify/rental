Feature: Get All Rent Charges and Payments

  Scenario: Given rent charges and payments for leases in two properties, When the PropertyMgr views the whole rent list, Then every charge and payment is listed with overdue charges and overdue leases first.
    Given rent charges and payments for leases in two properties
    When the PropertyMgr views the whole rent list
    Then every charge and payment is listed with overdue charges and overdue leases first.
