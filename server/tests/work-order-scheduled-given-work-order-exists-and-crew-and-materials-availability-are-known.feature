Feature: Work Order Scheduled

  Scenario: Given a work order exists and crew and materials availability are known, When the ConstrDept assigns a crew and sets start and end dates, Then Work Order Scheduled is recorded with dates and assigned team.
    Given a work order exists and crew and materials availability are known
    When the ConstrDept assigns a crew and sets start and end dates
    Then Work Order Scheduled is recorded with dates and assigned team