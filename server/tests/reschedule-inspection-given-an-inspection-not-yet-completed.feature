Feature: Reschedule Inspection
  As a Property Manager
  I want to move an inspection that is not yet done to another time
  So that the inspection list shows when the inspection really takes place

  Scenario: Given a scheduled inspection that is not completed, When the PropertyMgr moves it to another time, Then Inspection Rescheduled is recorded with the new time and the same inspector.
    Given a scheduled inspection that is not completed
    When the PropertyMgr moves it to another time
    Then Inspection Rescheduled is recorded with the new time and the same inspector.
