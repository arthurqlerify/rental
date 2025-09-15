Feature: Work Order Completion

  Scenario: Given scheduled work has been performed, When the ConstrWorker reports completion with actual dates, notes and photos, Then Work Order Completed is recorded and any variances are captured.
    Given scheduled work has been performed
    When the ConstrWorker reports completion with actual dates, notes and photos
    Then Work Order Completed is recorded and any variances are captured.