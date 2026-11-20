Feature: Reschedule Inspection
  As a Property Manager
  I want a moved inspection to keep the time it had before
  So that the inspection list shows which time it was moved from

  Scenario: Given a scheduled inspection that is not completed, When the PropertyMgr moves it to another time, Then the inspection keeps its old time and the list shows it as moved from that time.
    Given a scheduled inspection that is not completed
    When the PropertyMgr moves it to another time
    Then the inspection keeps its old time and the list shows it as moved from that time.
