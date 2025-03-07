// Counter to keep track of the number of cities added
var cityCount = 1;

// Function to handle the initial city-nights pair
function setupInitialCityNights() {
  var citiesContainer = document.getElementById("cities");

  // Check if city divs already exist, if not, add the initial city
  if (
    citiesContainer.getElementsByClassName("city-nights-wrapper").length === 0
  ) {
    var initialCityNightsWrapper = document.createElement("div");
    initialCityNightsWrapper.className = "city-nights-wrapper";

    // Create a new wrapper div for the city
    var cityWrapperDiv = document.createElement("div");
    cityWrapperDiv.className = "city-dropdown";

    var cityLabel = document.createElement("label");
    cityLabel.htmlFor = "city1";
    cityLabel.textContent = "City 1:";
    cityWrapperDiv.appendChild(cityLabel);

    var citySelect = document.getElementById("city1").cloneNode(true);
    citySelect.id = "city" + cityCount;
    cityWrapperDiv.appendChild(citySelect);

    // Create a new div for the number of nights setup
    var nightsDiv = document.createElement("div");
    nightsDiv.className = "nights-dropdown";

    var nightsLabel = document.createElement("label");
    nightsLabel.htmlFor = "nights1";
    nightsLabel.textContent = "Number of Nights:";
    nightsDiv.appendChild(nightsLabel);

    var nightsInput = document.getElementById("nights1").cloneNode(true);
    nightsInput.id = "nights" + cityCount;
    nightsDiv.appendChild(nightsInput);

    initialCityNightsWrapper.appendChild(cityWrapperDiv);
    initialCityNightsWrapper.appendChild(nightsDiv);

    citiesContainer.appendChild(initialCityNightsWrapper);
  }
}

// Function to handle adding new city dropdown
function addNewCityOption() {
  cityCount++;

  // Create a new wrapper div for the entire city-nights setup
  var newCityNightsWrapper = document.createElement("div");
  newCityNightsWrapper.className = "city-nights-wrapper";

  // Create a new wrapper div for the city
  var cityWrapperDiv = document.createElement("div");
  cityWrapperDiv.className = "city-dropdown";

  var cityLabel = document.createElement("label");
  cityLabel.htmlFor = "city" + cityCount;
  cityLabel.textContent = "City " + cityCount + ":";
  cityWrapperDiv.appendChild(cityLabel);

  var citySelect = document.getElementById("city1").cloneNode(true);
  citySelect.id = "city" + cityCount;
  cityWrapperDiv.appendChild(citySelect);

  newCityNightsWrapper.appendChild(cityWrapperDiv);

  // Create a new div for the number of nights setup
  var nightsDiv = document.createElement("div");
  nightsDiv.className = "nights-dropdown";

  var nightsLabel = document.createElement("label");
  nightsLabel.htmlFor = "nights" + cityCount;
  nightsLabel.textContent = "Number of Nights:";
  nightsDiv.appendChild(nightsLabel);

  var nightsInput = document.getElementById("nights1").cloneNode(true);
  nightsInput.id = "nights" + cityCount;
  nightsDiv.appendChild(nightsInput);

  newCityNightsWrapper.appendChild(nightsDiv);

  // Create a new wrapper div for the hotel rating setup
  var hotelWrapperDiv = document.createElement("div");
  hotelWrapperDiv.className = "city-dropdown";

  var hotelLabel = document.createElement("label");
  hotelLabel.htmlFor = "hotel-star" + cityCount;
  hotelLabel.textContent = "Hotel Star Rating:";
  hotelWrapperDiv.appendChild(hotelLabel);

  var hotelSelect = document.getElementById("hotel-star").cloneNode(true);
  hotelSelect.id = "hotel-star" + cityCount;
  hotelWrapperDiv.appendChild(hotelSelect);

  newCityNightsWrapper.appendChild(hotelWrapperDiv);

  var citiesContainer = document.getElementById("cities");
  citiesContainer.appendChild(newCityNightsWrapper);
}

// Function to populate dropdown with existing cities
function populateDropdown(select) {
  var existingCities = ["Shimla", "Manali", "Dalhousie", "Amritsar"];

  existingCities.forEach(function (city) {
    var option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    select.appendChild(option);
  });
}

// Call the setupInitialCityNights function on page load
window.onload = setupInitialCityNights;
