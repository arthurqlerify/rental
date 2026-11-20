Feature: Schedule Inspection
  As a Property Manager
  I want a turnover to have at most one open inspection
  So that the inspection list never shows two inspections for the same turnover

  Scenario: Given a turnover that already has an inspection that is neither completed nor cancelled, When the PropertyMgr schedules another inspection for it, Then no Inspection Scheduled is recorded and the turnover keeps its one open inspection.
    Given a turnover that already has an inspection that is neither completed nor cancelled
    When the PropertyMgr schedules another inspection for it
    Then no Inspection Scheduled is recorded and the turnover keeps its one open inspection.
