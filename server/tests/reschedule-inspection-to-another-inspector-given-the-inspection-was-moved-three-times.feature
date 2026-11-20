Feature: Reschedule Inspection
  As a Property Manager
  I want to give an inspection to another inspector after it was moved three times
  So that the limit on moves does not leave an inspection without an inspector who can go

  Scenario: Given an inspection that was already moved to another time three times, When the PropertyMgr gives it to another inspector at the same time, Then Inspection Rescheduled is recorded with the new inspector and the inspection still counts three moves.
    Given an inspection that was already moved to another time three times
    When the PropertyMgr gives it to another inspector at the same time
    Then Inspection Rescheduled is recorded with the new inspector and the inspection still counts three moves.
