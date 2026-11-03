Feature: Create Lease

  Scenario: Given a specific apartment is available for leasing and the PropertyMgr provides a lease end date that does not come after the start date, When the PropertyMgr submits Create Lease, Then no lease is created and the apartment stays available.
    Given a specific apartment is available for leasing and the PropertyMgr provides a lease end date that does not come after the start date
    When the PropertyMgr submits Create Lease
    Then no lease is created and the apartment stays available.
