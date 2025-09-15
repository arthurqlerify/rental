Feature: Record Apartment Vacated

  Scenario: Given the tenant has returned keys and the apartment is empty, When the PropertyMgr records the apartment as vacated, Then Apartment Vacated is recorded with timestamp and actor and downstream actors are notified.
    Given the tenant has returned keys and the apartment is empty
    When the PropertyMgr records the apartment as vacated
    Then Apartment Vacated is recorded with timestamp and actor and downstream actors are notified.