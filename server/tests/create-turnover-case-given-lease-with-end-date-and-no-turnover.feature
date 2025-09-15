Feature: Create Turnover Case

  Scenario: Given a lease has an end date scheduled and no turnover exists for that lease, When Automation creates a turnover case for the apartment, Then Turnover Created is recorded linking the lease, apartment and target dates.
    Given a lease has an end date scheduled and no turnover exists for that lease
    When Automation creates a turnover case for the apartment
    Then Turnover Created is recorded linking the lease, apartment and target dates.