Feature: Reschedule Inspection
  As a Property Manager
  I want a completed inspection to keep the time and inspector it was done with
  So that the record of the inspection stays true

  Scenario: Given an inspection that is already completed, When the PropertyMgr moves it to another time and another inspector, Then the request is refused and the inspection keeps its time and inspector.
    Given an inspection that is already completed
    When the PropertyMgr moves it to another time and another inspector
    Then the request is refused and the inspection keeps its time and inspector.
