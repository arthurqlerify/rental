Feature: Cancel Inspection
  As a Property Manager
  I want a completed inspection to stay completed
  So that the record of the inspection and its findings stays true

  Scenario: Given an inspection that is already completed, When the PropertyMgr cancels it with a reason, Then the request is refused and the inspection stays completed.
    Given an inspection that is already completed
    When the PropertyMgr cancels it with a reason
    Then the request is refused and the inspection stays completed.
