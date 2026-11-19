Feature: Renovation Report Creation

  Scenario: Given no inspection exists with the given id, When the Inspector itemizes damages with severity, locations and evidence, Then no Damage Report Created is recorded.
    Given no inspection exists with the given id
    When the Inspector itemizes damages with severity, locations and evidence
    Then no Damage Report Created is recorded.
