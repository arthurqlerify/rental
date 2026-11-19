Feature: Schedule Inspection
  As a Property Manager
  I want to schedule an inspection for a turnover
  So that I can ensure the apartment is ready for re-leasing

  Scenario: Given no turnover exists with the given id, When the PropertyMgr schedules the inspection with a date, time and inspector, Then no Inspection Scheduled is recorded.
    Given no turnover exists with the given id
    When the PropertyMgr schedules the inspection with a date, time and inspector
    Then no Inspection Scheduled is recorded.
