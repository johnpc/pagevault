Feature: Uploading an image into a block
  As a signed-in user
  I want to upload an image file into an image block
  So that my own pictures live on the page, not just remote URLs

  Background:
    Given I am signed in as the test user
    And I have a page titled "Gallery"

  Scenario: Upload an image file and see it rendered from PocketBase storage
    When I type "/image" into a new block
    And I choose "Image" from the slash menu
    And I upload the image fixture "pixel.png"
    Then the page shows an uploaded image served by PocketBase
