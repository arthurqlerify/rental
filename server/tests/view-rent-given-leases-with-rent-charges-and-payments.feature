Feature: View Rent

  Scenario: Given leases with overdue rent, rent not yet overdue and credit, When the PropertyMgr views the lease balances, Then each lease shows what is owed, what is overdue and any credit, with overdue leases first.
    Given leases with overdue rent, rent not yet overdue and credit
    When the PropertyMgr views the lease balances
    Then each lease shows what is owed, what is overdue and any credit, with overdue leases first.

  Scenario: Given rent charges and payments for leases in two properties, When the PropertyMgr narrows the rent to one property or to one lease, Then only the charges, payments and balances of that property or that lease are listed.
    Given rent charges and payments for leases in two properties
    When the PropertyMgr narrows the rent to one property or to one lease
    Then only the charges, payments and balances of that property or that lease are listed.
