Feature: Reschedule Inspection
  As a Property Manager
  I want an inspection to be moved to another time at most three times
  So that an inspection is not put off again and again

  Scenario: Given an inspection that was already moved to another time three times, When the PropertyMgr moves it again, Then the request is refused and the inspection keeps its time and its three moves.
    Given an inspection that was already moved to another time three times
    When the PropertyMgr moves it again
    Then the request is refused and the inspection keeps its time and its three moves.
