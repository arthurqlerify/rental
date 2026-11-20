Feature: Reschedule Inspection
  As a Property Manager
  I want to give an inspection that is not yet done to another inspector
  So that the inspection list shows who really carries it out

  Scenario: Given a scheduled inspection that is not completed, When the PropertyMgr gives it to another inspector, Then Inspection Rescheduled is recorded with the new inspector at the same time.
    Given a scheduled inspection that is not completed
    When the PropertyMgr gives it to another inspector
    Then Inspection Rescheduled is recorded with the new inspector at the same time.
