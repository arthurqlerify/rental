Feature: Issue Monthly Rent Charges

  Scenario: Given a lease that ends during the month, When the PropertyMgr issues the month's rent charges, Then the lease is charged only for the days up to its end date, due on the 1st.
    Given a lease that ends during the month
    When the PropertyMgr issues the month's rent charges
    Then the lease is charged only for the days up to its end date, due on the 1st.
