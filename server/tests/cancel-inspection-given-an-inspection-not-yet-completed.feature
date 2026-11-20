Feature: Cancel Inspection
  As a Property Manager
  I want to cancel an inspection that will not take place, with a reason
  So that the inspection list shows it will not happen, and why

  Scenario: Given a scheduled inspection that is not completed, When the PropertyMgr cancels it with a reason, Then Inspection Cancelled is recorded with the reason and the inspection stays in the list marked as cancelled.
    Given a scheduled inspection that is not completed
    When the PropertyMgr cancels it with a reason
    Then Inspection Cancelled is recorded with the reason and the inspection stays in the list marked as cancelled.
