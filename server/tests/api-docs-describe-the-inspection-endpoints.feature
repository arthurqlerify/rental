Feature: Inspection API Docs

  Scenario: Given the inspection endpoints the API serves, When a developer opens the API docs at /api/docs, Then each inspection endpoint is described, with how to reschedule and cancel an inspection.
    Given the inspection endpoints the API serves
    When a developer opens the API docs at /api/docs
    Then each inspection endpoint is described, with how to reschedule and cancel an inspection.
