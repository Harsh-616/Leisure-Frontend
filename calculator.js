window.finalPrices = {}; // Corrected declaration
const BACKEND_URL = "https://leisure-backend.onrender.com"; // ✅ Backend URL

// Function to fetch cities from the form
function getCities() {
  const cities = [];
  const cityContainers = document.querySelectorAll(".city-nights-wrapper");

  cityContainers.forEach((container) => {
    const citySelect = container.querySelector(".city-dropdown select");
    const nightsInput = container.querySelector(".nights-dropdown input");
    const hotelStarSelect = document.getElementById("hotel-star");

    if (citySelect && nightsInput && hotelStarSelect) {
      const city = citySelect.value.trim().toLowerCase();
      const nights = parseInt(nightsInput.value);
      const hotelStar = parseInt(hotelStarSelect.value);

      if (city && nights > 0 && !isNaN(hotelStar)) {
        cities.push({ city, nights, hotelStar });
      }
    }
  });

  console.log("Cities:", cities);
  return cities;
}

// Predefined mapping of destination IDs for each circuit
const circuitDestinationIds = {
  Himachal: "a",
  Uttranchal: "b",
  Kerala: "c",
  South: "d",
  "North Kerala": "e",
  Kashmir: "f",
  "Gangtok & Darjeeling": "g",
  Goa: "h",
  "Golden Triangle": "i",
};

// Event listener for the price calculation button
document
  .getElementById("submit-btn")
  .addEventListener("click", async function () {
    const cities = getCities();
    const adults = parseInt(document.getElementById("adults").value);
    const cwb = parseInt(document.getElementById("CWB").value);
    const cwob = parseInt(document.getElementById("CWOB").value);
    const extraAdults = parseInt(document.getElementById("Extra Adults").value);
    const vehicle = document.getElementById("vehicle").value;
    const circuit = document.getElementById("circuit").value;

    console.log("Form Data:", {
      cities,
      adults,
      cwb,
      cwob,
      extraAdults,
      vehicle,
      circuit,
    });

    const token = sessionStorage.getItem("token"); // Retrieve JWT token from Session Storage

    if (!token) {
      alert("You must be logged in to perform this action.");
      window.location.href = "/index.html"; // Redirect if not logged in
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/get-data`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Pass JWT token
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from server.");
      }

      const jsonData = await response.json();
      calculatePrices(
        jsonData.data,
        cities,
        adults,
        cwb,
        cwob,
        extraAdults,
        vehicle,
        circuit
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to calculate prices. Please try again.");
    }
  });

// Function to calculate prices based on the data
function calculatePrices(
  data,
  cities,
  adults,
  cwb,
  cwob,
  extraAdults,
  vehicle,
  circuit
) {
  const headers = data[0];
  const jsonDataArr = data.slice(1).map((row) => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });

  let totalAdultCost = 0;
  let totalCwbCost = 0;
  let totalCwobCost = 0;
  let totalExtraAdultCost = 0;
  let hotelNames = [];
  let totalDays = 0;

  cities.forEach((city) => {
    const { city: cityName, nights, hotelStar } = city;
    totalDays += nights; // Add nights for each city to total days

    const cityData = jsonDataArr.find((row) => {
      const destination = row["Destination"];
      const category = row["Category"];
      return (
        destination?.toLowerCase() === cityName &&
        parseInt(category) === hotelStar
      );
    });

    if (cityData) {
      hotelNames.push(cityData["Hotel"]);

      const adultRate = parseFloat(cityData["Per Night Rate"]) || 0;
      const extraAdultRate = parseFloat(cityData["Ex. A"]) || 0;
      const cityCwbRate = parseFloat(cityData["CWB"]) || 0;
      const cityCwobRate = parseFloat(cityData["CWOB"]) || 0;

      totalAdultCost += adults > 0 ? adultRate * nights : 0;
      totalCwbCost += cwb > 0 ? cityCwbRate * nights : 0;
      totalCwobCost += cwob > 0 ? cityCwobRate * nights : 0;
      totalExtraAdultCost += extraAdults > 0 ? extraAdultRate * nights : 0;
    }
  });

  const destinationId = circuitDestinationIds[circuit];

  let vehicleData = null;
  if (destinationId) {
    vehicleData = jsonDataArr.find(
      (row) =>
        row["Vehicle"] === vehicle && row["Destination ID"] === destinationId
    );
  }

  let vehiclePerPersonCost = 0;
  if (vehicleData) {
    const vehicleRate = parseFloat(vehicleData["Rate"]) || 0;
    vehiclePerPersonCost =
      (vehicleRate * (totalDays + 1)) / Math.max(1, adults);
  }

  totalAdultCost += vehiclePerPersonCost;
  if (totalAdultCost <= 15000) {
    totalAdultCost += totalAdultCost * 0.2; // +20%
  } else if (totalAdultCost <= 25000) {
    totalAdultCost += totalAdultCost * 0.18; // +18%
  } else if (totalAdultCost <= 35000) {
    totalAdultCost += totalAdultCost * 0.16; // +16%
  } else {
    totalAdultCost += totalAdultCost * 0.15; // +15%
  }
  //Storecalculated prices in the global variable
  window.finalPrices = {
    totalAdultCost,
    totalCwbCost,
    totalCwobCost,
    totalExtraAdultCost,
    adults,
    cwb,
    cwob,
    extraAdults,
    vehicle,
    hotelNames,
    cities,
  };

  // Update the UI with the calculated prices
  updatePriceUI(
    totalAdultCost,
    totalCwbCost,
    totalCwobCost,
    totalExtraAdultCost
  );
}

// Function to update the UI with calculated prices
function updatePriceUI(
  totalAdultCost,
  totalCwbCost,
  totalCwobCost,
  totalExtraAdultCost
) {
  document.getElementById(
    "final-price"
  ).textContent = `Adult Price (per person): Rs. ${totalAdultCost.toFixed(2)}`;
  document.getElementById(
    "final-cwb-price"
  ).textContent = `CWB Price (per person): Rs. ${totalCwbCost.toFixed(2)}`;
  document.getElementById(
    "final-cwob-price"
  ).textContent = `CWOB Price (per person): Rs. ${totalCwobCost.toFixed(2)}`;
  document.getElementById(
    "final-adult-price"
  ).textContent = `Extra Adult Price (per person): Rs. ${totalExtraAdultCost.toFixed(
    2
  )}`;
  document.getElementById("final-extra-adult-price").textContent =
    "Prices include vehicle cost.";
}

// Define the getFinalPrices function to return the final calculated prices
function getFinalPrices() {
  if (!window.finalPrices || Object.keys(window.finalPrices).length === 0) {
    alert(
      "Prices have not been calculated yet. Please calculate prices first."
    );
    return null;
  }
  return window.finalPrices;
}

// PDF generation logic
// PDF generation logic (updated)
document
  .getElementById("download-pdf-btn")
  .addEventListener("click", async function () {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("You are not logged in. Redirecting to the login page.");
      window.location.href = "/index.html";
      return;
    }

    try {
      // Fetch only user details
      const userResponse = await fetch(`${BACKEND_URL}/get-user-data`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        credentials: "include",
      });
    
      if (!userResponse.ok) throw new Error("Failed to fetch user data");
    
      const { username, phone, designation } = await userResponse.json();
    
      console.log("User Details:", { username, phone, designation });
    
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Failed to fetch user details. Please try again.");
    }
    

      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      if (!prices) return;

      const { username, phone, designation } = await userResponse.json();
      const {
        totalAdultCost,
        totalCwbCost,
        totalCwobCost,
        totalExtraAdultCost,
        adults,
        cwb,
        cwob,
        extraAdults,
        vehicle,
        hotelNames,
        cities,
      } = prices;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      // Get circuit value safely
      const circuitElement = document.getElementById("circuit");
      const circuit = circuitElement ? String(circuitElement.value).trim() : "";

      // Normalize the circuit name
      const normalizedCircuit = circuit.toLowerCase();

      // Banner Map with correct mappings
      const bannerMap = {
        "golden triangle": "GoldenTraingle-banner.png",
        "gangtok & darjeeling": "GangtokDarjeeling-banner.png",
        goa: "Goa-banner.png",
        himachal: "Himachal-banner.png",
        kashmir: "Kashmir-banner.png",
        kerala: "Kerala-banner.png",
        "north kerala": "NorthKerala-banner.png",
        south: "South-banner.png",
        uttranchal: "Uttranchal-banner.png",
      };

      // Ensure a valid banner filename or use a fallback image
      const bannerFileName =
        bannerMap[normalizedCircuit] || "default-banner.png";
      const bannerImageUrl = `banner/${bannerFileName}`;

      console.log("Banner Image Path:", bannerImageUrl);

      const logoUrl = "logo.jpeg";
      let yOffset = 10;

      // Helper function to load and resize images
      const loadImage = async (url, scale = 1) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = base64;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL();
      };

      // Add banner with 50% scale
      const banner = await loadImage(bannerImageUrl, 0.5);
      doc.addImage(banner, "PNG", 10, yOffset, 190, 50);
      yOffset += 60;

      // Add logo
      const logo = await loadImage(logoUrl);
      doc.addImage(logo, "JPEG", 160, 250, 30, 20);

      // Add borders
      doc.setDrawColor(54, 158, 54);
      doc.setLineWidth(0.5);
      doc.rect(5, 5, 200, 287);
      doc.rect(7, 7, 196, 283);

      // Package details
      const totalNights = cities.reduce((acc, city) => acc + city.nights, 0);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text(
        20,
        yOffset,
        `${cities
          .map((city) => city.city.charAt(0).toUpperCase() + city.city.slice(1))
          .join(", ")} Package`
      );
      yOffset += 10;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        20,
        yOffset,
        `No of pax: ${adults + extraAdults} adults + ${cwb + cwob} kids`
      );
      yOffset += 10;

      doc.text(20, yOffset, `Stay: ${totalNights} nights`);
      yOffset += 10;

      // Dynamic pricing sections
      const addPriceSection = (condition, text) => {
        if (condition) {
          doc.text(20, yOffset, text);
          yOffset += 10;
        }
      };

      addPriceSection(
        adults > 0,
        `Adult Price: Rs. ${totalAdultCost.toFixed(2)}/- per person`
      );

      addPriceSection(
        extraAdults > 0,
        `Extra Adult Price: Rs. ${totalExtraAdultCost.toFixed(2)}/- per person`
      );

      addPriceSection(
        cwb > 0,
        `Child with bed (CWB): Rs. ${totalCwbCost.toFixed(2)}/- per person`
      );

      addPriceSection(
        cwob > 0,
        `Child without bed (CWOB): Rs. ${totalCwobCost.toFixed(2)}/- per person`
      );

      // Package includes
      doc.setFont("Helvetica", "bold");
      doc.text(20, yOffset, "Package includes:");
      yOffset += 10;

      cities.forEach((city, index) => {
        doc.setFont("Helvetica", "normal");
        doc.text(
          20,
          yOffset,
          `${city.nights} nights ${
            city.city.charAt(0).toUpperCase() + city.city.slice(1)
          } in Hotel ${hotelNames[index]} or similar`
        );
        yOffset += 7;
      });

      doc.text(20, yOffset, `Transportation by ${vehicle}`);
      yOffset += 7;
      doc.text(20, yOffset, "Sightseeing as per given itinerary");
      yOffset += 10;

      // Terms and conditions
      doc.setFont("Helvetica", "bold");
      doc.text(20, yOffset, "Note:");
      yOffset += 7;

      doc.setFont("Helvetica", "normal");
      const notes = [
        "Above costing is based on base category of the room at the mentioned hotels.",
        "Does not include:",
        "• Anything not mentioned in inclusions",
        "• GST @ 5%",
        "• Trainfare/Airfare",
        "• Other terms as per company policy",
      ];

      notes.forEach((note) => {
        doc.text(20, yOffset, note);
        yOffset += 7;
      });

      // Contact information
      yOffset += 7;
      // Convert values to strings before passing them to jsPDF.text()
      doc.text(20, yOffset, `For more information, contact:`);
      yOffset += 7;

      doc.text(20, yOffset, String(username || "N/A")); // Ensure username is a string
      yOffset += 7;

      doc.text(20, yOffset, String(designation || "N/A")); // Ensure designation is a string
      yOffset += 7;

      doc.text(20, yOffset, String(phone || "N/A")); // Ensure phone is a string

      doc.save("Tour_Package_Quotation.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF. Please try again.");
    }
  });
