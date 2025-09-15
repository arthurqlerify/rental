Feature: Renovation Estimate Request

  Scenario: Given a turnover with a damage report or an upgrade need and apartment profile data, When the PropertyMgr requests a renovation estimate including levels none, good, better and premium, Then Renovation Estimate Requested is recorded and the construction department is notified.
    Given a turnover with a damage report or an upgrade need and apartment profile data
    When the PropertyMgr requests a renovation estimate including levels none, good, better and premium
    Then Renovation Estimate Requested is recorded and the construction department is notified.