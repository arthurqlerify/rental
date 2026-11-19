Feature: Renovation Report Creation
  As an Inspector
  I want a damage report to follow only a completed inspection that found damage
  So that every damage report rests on a real inspection

  Scenario: Given an inspection that has been completed and found no damage, When the Inspector itemizes damages with severity, locations and evidence, Then no Damage Report Created is recorded.
    Given an inspection that has been completed and found no damage
    When the Inspector itemizes damages with severity, locations and evidence
    Then no Damage Report Created is recorded.
