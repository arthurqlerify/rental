Feature: Write Apartment Note

  Scenario: Given no apartment with the given ID, When the PropertyMgr writes a note on it, Then the request is refused.
    Given no apartment with the given ID
    When the PropertyMgr writes a note on it
    Then the request is refused.
