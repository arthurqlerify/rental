Feature: Inspection Completed with the move-out checklist

  Scenario: Given an inspection appointment exists for the turnover, When the Inspector ticks move-out checklist items and marks the inspection complete, Then the ticked checklist items are saved with the inspection.
    Given an inspection appointment exists for the turnover
    When the Inspector ticks move-out checklist items and marks the inspection complete
    Then the ticked checklist items are saved with the inspection.
