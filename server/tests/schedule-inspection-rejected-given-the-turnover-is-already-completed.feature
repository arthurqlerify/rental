Feature: Schedule Inspection
  As a Property Manager
  I want to schedule an inspection for a turnover
  So that I can ensure the apartment is ready for re-leasing

  Scenario: Given a turnover that is already completed with a ready-to-rent date, When the PropertyMgr schedules the inspection with a date, time and inspector, Then no Inspection Scheduled is recorded.
    Given a turnover that is already completed with a ready-to-rent date
    When the PropertyMgr schedules the inspection with a date, time and inspector
    Then no Inspection Scheduled is recorded.
