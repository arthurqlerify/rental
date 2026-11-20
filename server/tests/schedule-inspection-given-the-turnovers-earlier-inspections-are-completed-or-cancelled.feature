Feature: Schedule Inspection
  As a Property Manager
  I want to schedule a new inspection once the turnover's earlier ones are done or cancelled
  So that a cancelled or finished inspection does not block the next one

  Scenario: Given a turnover whose earlier inspections are completed or cancelled, When the PropertyMgr schedules the inspection with a date, time and inspector, Then Inspection Scheduled is recorded and it is the turnover's only open inspection.
    Given a turnover whose earlier inspections are completed or cancelled
    When the PropertyMgr schedules the inspection with a date, time and inspector
    Then Inspection Scheduled is recorded and it is the turnover's only open inspection.
