Feature: Reschedule Inspection
  As a Property Manager
  I want an inspection moved more than once to show the time it had just before the last move
  So that the inspection list shows which time it was moved from

  Scenario: Given an inspection that was already moved to another time, When the PropertyMgr moves it again, Then the list shows it as moved from the time it had just before.
    Given an inspection that was already moved to another time
    When the PropertyMgr moves it again
    Then the list shows it as moved from the time it had just before.
