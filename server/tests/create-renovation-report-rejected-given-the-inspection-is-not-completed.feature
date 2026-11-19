Feature: Renovation Report Creation

  Scenario: Given an inspection has been scheduled but not completed, When the Inspector itemizes damages with severity, locations and evidence, Then no Damage Report Created is recorded.
    Given an inspection has been scheduled but not completed
    When the Inspector itemizes damages with severity, locations and evidence
    Then no Damage Report Created is recorded.
