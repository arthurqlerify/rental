Feature: Rent API Docs

  Scenario: Given the rent endpoints the API serves, When a developer opens the API docs at /api/docs, Then each rent endpoint is described with its request, its responses and its filters.
    Given the rent endpoints the API serves
    When a developer opens the API docs at /api/docs
    Then each rent endpoint is described with its request, its responses and its filters.
