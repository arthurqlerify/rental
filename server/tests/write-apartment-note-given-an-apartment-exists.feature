Feature: Write Apartment Note

  Scenario: Given an apartment with a tenant and no note, When the PropertyMgr writes a note on it, Then the note is kept with the time it was saved and the Apartments list shows it.
    Given an apartment with a tenant and no note
    When the PropertyMgr writes a note on it
    Then the note is kept with the time it was saved and the Apartments list shows it.

  Scenario: Given an apartment with a note, When the PropertyMgr writes a new note of 500 characters on it, Then the new note replaces the old one.
    Given an apartment with a note
    When the PropertyMgr writes a new note of 500 characters on it
    Then the new note replaces the old one.

  Scenario: Given an apartment with a note, When the PropertyMgr saves an empty note on it, Then the apartment no longer has a note.
    Given an apartment with a note
    When the PropertyMgr saves an empty note on it
    Then the apartment no longer has a note.

  Scenario: Given an empty apartment with a note, When a tenant moves in and later leaves, Then the note is still on the apartment.
    Given an empty apartment with a note
    When a tenant moves in and later leaves
    Then the note is still on the apartment.
