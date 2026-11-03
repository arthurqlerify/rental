Feature: Rent API Docs

  Scenario: Given the API docs served at /api/docs, When a developer looks up the rent endpoints, Then each one is described with its request and its response.
    Given the API docs served at /api/docs
    When a developer looks up the rent endpoints
    Then each one is described with its request and its response.
