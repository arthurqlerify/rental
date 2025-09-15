Feature: Renovation Plan Selection

  Scenario: Given estimate options and projected rent uplift are available, When the PropertyMgr selects one plan level or chooses no renovation, Then Renovation Plan Selected is recorded with the chosen level, budget and expected completion window.
    Given estimate options and projected rent uplift are available
    When the PropertyMgr selects one plan level as "good" with budget approved and a projected rent of "1600"
    Then Renovation Plan Selected is recorded with the chosen level, budget and expected completion window