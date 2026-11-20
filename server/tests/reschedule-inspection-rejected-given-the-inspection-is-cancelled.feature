Feature: Reschedule Inspection
  As a Property Manager
  I want a cancelled inspection to stay cancelled
  So that the inspection list does not show a time for an inspection that will not happen

  Scenario: Given an inspection that is cancelled, When the PropertyMgr moves it to another time, Then the request is refused and the inspection stays cancelled at its old time.
    Given an inspection that is cancelled
    When the PropertyMgr moves it to another time
    Then the request is refused and the inspection stays cancelled at its old time.
