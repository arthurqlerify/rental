Feature: Complete Turnover
  As an automated system
  I want to complete a turnover case
  So that the apartment is marked as ready to rent and marketing is notified

  Scenario: Given the final inspection has passed and there are no open work orders, When Automation completes the turnover case, Then Turnover Completed is recorded and the apartment status becomes ready to rent and marketing is notified.
    Given the final inspection has passed and there are no open work orders
    When Automation completes the turnover case
    Then Turnover Completed is recorded and the apartment status becomes ready to rent and marketing is notified