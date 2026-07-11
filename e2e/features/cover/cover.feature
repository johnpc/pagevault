Feature: Uploading a page cover image
  As a signed-in user
  I want to upload my own cover image for a page banner
  So that a page can have a custom banner, not just a gradient

  Background:
    Given I am signed in as the test user
    And I have a page titled "Trip"

  Scenario: Upload a cover image and see the banner served by PocketBase
    When I open the page "Trip"
    And I upload the cover fixture "pixel.png"
    Then the page cover is served by PocketBase
