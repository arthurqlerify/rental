Feature: Write Apartment Note

  Scenario: Given an apartment with a note, When the PropertyMgr writes a note longer than 500 characters on it, Then the request is refused and the earlier note is kept.
    Given an apartment with a note
    When the PropertyMgr writes a note longer than 500 characters on it
    Then the request is refused and the earlier note is kept.
