Feature: Cancel Inspection
  As a Property Manager
  I want every cancelled inspection to say why it was cancelled
  So that the team knows why the inspection did not happen

  Scenario: Given a scheduled inspection that is not completed, When the PropertyMgr cancels it without a reason, Then the request is refused and the inspection is still scheduled.
    Given a scheduled inspection that is not completed
    When the PropertyMgr cancels it without a reason
    Then the request is refused and the inspection is still scheduled.
