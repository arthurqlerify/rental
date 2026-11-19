Feature: Renovation Report Creation

  Scenario: Given an inspection has been completed and found no damages or issues, When the Inspector itemizes damages with severity, locations and evidence, Then no Damage Report Created is recorded.
    Given an inspection has been completed and found no damages or issues
    When the Inspector itemizes damages with severity, locations and evidence
    Then no Damage Report Created is recorded.
