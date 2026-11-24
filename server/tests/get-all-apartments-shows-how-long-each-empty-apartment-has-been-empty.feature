Feature: Get All Apartments

  Scenario: Given an apartment vacated ten days ago, an apartment created empty three days ago and an apartment with a tenant, When the PropertyMgr views the Apartments list, Then each empty apartment shows how many days it has been empty and the apartment with a tenant shows nothing.
    Given an apartment vacated ten days ago, an apartment created empty three days ago and an apartment with a tenant
    When the PropertyMgr views the Apartments list
    Then each empty apartment shows how many days it has been empty and the apartment with a tenant shows nothing.

  Scenario: Given an empty apartment saved before its empty-since date was kept, When the PropertyMgr views the Apartments list, Then it shows the days since its tenant was recorded as leaving.
    Given an empty apartment saved before its empty-since date was kept
    When the PropertyMgr views the Apartments list
    Then it shows the days since its tenant was recorded as leaving.
