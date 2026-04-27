import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, auth, updateDoc, query, where, doc, setDoc, getDoc, serverTimestamp } from '../../firebase'; // Assuming firebase is already set up
import './NewQuote.css';
import CustomAlert from '../../components/CustomAlert/CustomAlert';
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom"; // ✅ Import useParams
import { v4 as uuidv4 } from "uuid"; // ✅ Import UUID for unique Quote IDs



const QuotingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [fabricCollectionOptions, setFabricCollectionOptions] = useState([]);
  const [selectedFabricOption, setSelectedFabricOption] = useState('');
  const [fabricColorOptions, setFabricColorOptions] = useState([]);
  const [selectedFabricColorOption, setSelectedFabricColorOption] = useState('');
  const [productsData, setProductsData] = useState([]);
  const [pricingRules, setPricingRules] = useState(new Map()); // Use Map for pricing rules
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const navigate = useNavigate(); // ✅ Enables navigation
  const [widthFraction, setWidthFraction] = useState('');
  const [heightFraction, setHeightFraction] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [hasPrefilledProduct, setHasPrefilledProduct] = useState(false);

  const [isQuickShip, setIsQuickShip] = useState(false); // Track if Quick Ship Panel

  const [optionsData, setOptionsData] = useState({}); // Store options categorized by product
  const [sizeBasedPricing, setSizeBasedPricing] = useState(new Map());
  const [sizeBasedPricingData, setSizeBasedPricingData] = useState({});
  const [quantity, setQuantity] = useState(1); // Default quantity is 1
  const [, setShowMotorizationOptions] = useState(false);
  const [tooltip, setTooltip] = useState(""); // Ensures it's always a string
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedSize] = useState(''); 
  const [showAlert, setShowAlert] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentQuoteId, setCurrentQuoteId] = useState(null); // ✅ Store Quote ID
  const [hoveredInfo, setHoveredInfo] = useState(null);   
  const [categories, setCategories] = useState([]); // ✅ State for storing categories

  const [customerName, setCustomerName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [sidemark, setSidemark] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [costFactor, setCostFactor] = useState(1); // Default multiplier = 1
  const [hasAddedItem, setHasAddedItem] = useState(false); // ✅ Track if an item has been added
  const [suggestedRetailPrice, setSuggestedRetailPrice] = useState(0);
  const { quoteId, editItemIndex } = useParams();
  const numericEditItemIndex = parseInt(editItemIndex, 10);
  const isEditMode = !isNaN(numericEditItemIndex);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [, setControlOption] = useState("");

  const [mountingPosition, setMountingPosition] = useState("");
  const [windowLocation, setWindowLocation] = useState("");
  const [linerOption, setLinerOption] = useState("N/A");

  const [shadeStyle, setShadeStyle] = useState("N/A");
  const [motorizationOption, setMotorizationOption] = useState("N/A");

  const [decorativeTapeType, setDecorativeTapeType] = useState("N/A");
  const [decorativeTapeColor, setDecorativeTapeColor] = useState("N/A");
  const [additionalOptions, setAdditionalOptions] = useState("N/A");
  const [hardwareOption, setHardwareOption] = useState("N/A");
  const [hardwareColor, setHardwareColor] = useState("N/A");
  const [headboxOption, setHeadboxOption] = useState("N/A");
  const [handleOption, setHandleOption] = useState("N/A");
  const [finialOption, setFinialOption] = useState("N/A");
  const [tiltOption, setTiltOption] = useState("N/A");
  const [controlPosition, setControlPosition] = useState("N/A");
  const [fasciaColor, setFasciaColor] = useState("N/A");
  const [hingeColor, setHingeColor] = useState("N/A");
  const [pleatStyle, setPleatStyle] = useState("N/A");
  const [linerColor, setLinerColor] = useState("N/A");
  const [alertMessage, setAlertMessage] = useState("");
  const [, setInitialPrefillComplete] = useState(false);

  const resolvedLinerColor = linerOption === "N/A" ? "N/A" : (linerColor || "N/A");

  const [minMaxDimensions, setMinMaxDimensions] = useState({
    minWidth: null,  // Use null instead of Infinity
    maxWidth: null,  // Use null instead of -Infinity
    minHeight: null,
    maxHeight: null,
  });
  

  const fractions = ['', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'];

  const formatProductName = (product) => {
    if (product === "2.5 Faux Wood Blinds") return '2.5" Faux Wood Blinds';
    if (product === "2 Faux Wood Blinds") return '2" Faux Wood Blinds';
    return product;
  };
  

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("📡 Fetching categories from Firestore...");
        const productsRef = collection(db, "products"); // 🔥 Fetch from "products" collection
        const querySnapshot = await getDocs(productsRef);
  
        // Extract unique categories from products
        const categorySet = new Set();
        querySnapshot.forEach((doc) => {
          const productData = doc.data();
          if (productData.category) {
            categorySet.add(productData.category);
          }
        });
  
        const uniqueCategories = [...categorySet]; // Convert Set to Array
        console.log("✅ Categories Loaded:", uniqueCategories);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      }
    };
  
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchCostFactor = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setCostFactor(userSnap.data().costFactor || 1);
      } catch (error) {
        console.error("Error fetching cost factor:", error);
      }
    };
    fetchCostFactor();
  }, []);

  useEffect(() => {
    let storedQuoteId = quoteId || localStorage.getItem("currentQuoteId");
    let storedHasAddedItem = localStorage.getItem("hasAddedItem") === "true";
  
    if (storedQuoteId) {
      setCurrentQuoteId(storedQuoteId);
    } else {
      console.warn("⚠️ No Quote ID found! The 'Go to Quote' button may not appear.");
    }
  
    setHasAddedItem(storedHasAddedItem);
  }, [quoteId]);
  
  
  

  useEffect(() => {
    const fetchQuoteData = async () => {
      if (!quoteId) {
        console.warn("⚠️ No `quoteId` found in URL!");
        return;
      }
  
      const user = auth.currentUser; // ✅ Get logged-in user
      if (!user) {
        console.error("❌ User is not authenticated");
        navigate("/signin"); // ✅ Redirect unauthenticated users
        return;
      }
  
      try {
        console.log("📌 Fetching quote data for ID:", quoteId);
        const quoteRef = doc(db, "quotes", quoteId);
        const quoteSnap = await getDoc(quoteRef);
  
        if (quoteSnap.exists()) {
          const data = quoteSnap.data();
          console.log("✅ Loaded customer info:", data);
  
          // ✅ Check if the current user is the creator
          if (data.createdBy !== user.uid) {
            console.warn("🚨 Unauthorized access! Redirecting...");
            navigate("/unauthorized"); // ✅ Redirect unauthorized users
            return;
          }
  
          setCustomerName(data.customerName || "");
          setPoNumber(data.poNumber || "");
          setSidemark(data.sidemark || "");
          setAddress(data.address || "");
          setPhoneNumber(data.phoneNumber || "");
        } else {
          console.warn("⚠️ No quote found with ID:", quoteId);
        }
      } catch (error) {
        console.error("❌ Error fetching quote data:", error);
      }
    };
  
    fetchQuoteData();
  }, [quoteId, navigate]); // ✅ Added `navigate` to dependencies
  

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error("❌ No authenticated user found.");
        return;
      }
  
      try {
        console.log("📡 Fetching user data for:", user.uid);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("✅ User Data Loaded:", userData);
  
          const parsedCostFactor = parseFloat(userData.CostFactor);
          setCostFactor(!isNaN(parsedCostFactor) ? parsedCostFactor : 1);
          console.log("💰 Cost Factor Set To:", !isNaN(parsedCostFactor) ? parsedCostFactor : 1);
        } else {
          console.warn("⚠️ No user document found.");
        }
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      }
    };
  
    fetchUserData();
  }); // Add navigate here if it's used inside the effect
  
  const generateShortQuoteId = (id) => {
    return id.slice(-4); // Extracts the last 4 characters of the Firestore-generated ID
  };
  

const roundedWidth = Math.ceil(width / 12) * 12;
const roundedHeight = Math.ceil(height / 12) * 12;
// eslint-disable-next-line
const dimensionKey = `${roundedWidth}x${roundedHeight}`;

const getAvailableColors = (tapeType) => {
  const colorOptions = {
    Diamond: ["Stucco", "Tender Taupe", "Acadia Haze"],
    Chain: ["Dark Beige", "Maize", "Navy", "Acadia Haze", "Rock Gray"],
    Scalloped: ["Cream", "Navy", "Tender Taupe", "Acadia Haze", "Morning Glory", "Rock Gray"],
  };

  return colorOptions[tapeType] || [];
};

const handleSaveItem = async () => {
  let errors = validateForm(); // ✅ Run validation and get errors object

  if (Object.keys(errors).length > 0) {
    console.warn("⚠️ Form validation failed, not saving!");
    setValidationErrors(errors); // ✅ Update validation state
    return;
  }

  // ✅ Convert width and height including fractions
  const widthInches = parseFloat(width) + calculateInches(0, widthFraction);
  const heightInches = parseFloat(height) + calculateInches(0, heightFraction);

  // ✅ Ensure dimensions do not exceed the max limits before saving
  if (widthInches > minMaxDimensions.maxWidth) {
    errors.width = `Maximum width is ${minMaxDimensions.maxWidth} inches.`;
  }
  if (heightInches > minMaxDimensions.maxHeight) {
    errors.height = `Maximum height is ${minMaxDimensions.maxHeight} inches.`;
  }

    // ✅ Prevent saving if errors exist
    if (Object.keys(errors).length > 0) {
      console.warn("🚨 Validation failed! Fix errors before saving.", errors);
      setValidationErrors(errors);
      return;
    }

  // ✅ Use existing quoteId or retrieve from localStorage
  let quoteToUpdateId = quoteId || localStorage.getItem("currentQuoteId");

  if (!quoteToUpdateId) {
    quoteToUpdateId = uuidv4();
    const shortQuoteId = generateShortQuoteId(quoteToUpdateId); // Generate short ID
    localStorage.setItem("currentQuoteId", quoteToUpdateId);
    localStorage.setItem("shortQuoteId", shortQuoteId); // Store short ID
  }
  

  console.log("✅ Using Quote ID:", quoteToUpdateId);

  const user = auth.currentUser; // ✅ Get the logged-in user
  if (!user) {
    console.error("❌ User is not authenticated");
    return;
  }

  const updatedItem = {
    customerName,
    poNumber,
    sidemark,
    address,
    phoneNumber,
    category: selectedCategory,
    product: selectedProduct,
    fabricOption: selectedFabricOption || "N/A",
    fabricColor: selectedFabricColorOption || "N/A",
    width,
    widthFraction,
    height,
    heightFraction,
    quantity,
    controlOptions: selectedOptions["Control Options"] || "N/A",
    controlPosition: selectedOptions["Control Position"] || "N/A",
    mountingPosition: selectedOptions["Mounting Position"] || "N/A",
    windowLocation: selectedOptions["Window Location"] || "N/A",
    hardwareColor: selectedOptions["Hardware Color"] || "N/A",
    finialOptions: selectedOptions["Finial Options"] || "N/A",
    tiltOptions: selectedOptions["Tilt Options"] || "N/A",
    hingeColor: selectedOptions["Hinge Color"] || "N/A",
    linerOptions: selectedOptions["Liner Options"] || "N/A",
    linerColor: selectedOptions["Liner Color"] || "N/A",
    shadeStyles: selectedOptions["Shade Styles"] || "N/A",
    pleatStyles: selectedOptions["Pleat Styles"] || "N/A",
    motorizationOptions: Array.isArray(selectedOptions["Motorization Options"])
      ? selectedOptions["Motorization Options"]
      : [],
    handleOptions: selectedOptions["Handle Options"] || "N/A",
    headboxOptions: selectedOptions["Headbox Options"] || "N/A",
    fasciaColor: selectedOptions["Fascia Color"] || "N/A",
    hardwareOptions:
      selectedProduct === "Quick Ship Panels"
        ? selectedOptions["Hardware Options"] || "N/A"
        : "N/A",
    additionalOptions: selectedOptions["Additional Options"] || "N/A",
    decorativeTapeType: selectedOptions["Decorative Tape Type"] || "N/A",
    decorativeTapeColor: selectedOptions["Decorative Tape Color"] || "N/A",
    totalPrice: Math.round(totalPrice),
    suggestedRetailPrice: Math.round(suggestedRetailPrice),
  };
  

  console.log("📌 Updated Item Data:", updatedItem);

  try {
    const quoteRef = doc(db, "quotes", quoteToUpdateId);
    const quoteSnap = await getDoc(quoteRef);
    
    
    let quoteData = { items: [] }; // Default if no quote exists
    if (quoteSnap.exists()) {
      quoteData = quoteSnap.data(); // Retrieve existing quote data
    }

    // ✅ Add new item to existing quote
    quoteData.items.push(updatedItem);

    await setDoc(quoteRef, {
      ...quoteData,
      customerName,
      poNumber,
      sidemark,
      address,
      phoneNumber,
      status: "Quote",
      timestamp: serverTimestamp(),
      createdBy: user.uid,
      shortQuoteId: generateShortQuoteId(quoteToUpdateId), // ✅ Ensure this is present
    });
    

    console.log("✅ Quote successfully updated!");


    // ✅ Ensure re-render by setting states **AFTER** Firestore update
    localStorage.setItem("hasAddedItem", "true");

    localStorage.setItem("currentQuoteId", quoteToUpdateId);
    setCurrentQuoteId(quoteToUpdateId);
    setHasAddedItem(true); // ✅ Trigger "Go to Quote" button
    setAlertMessage("Your item(s) has been added to the quote.");
    setShowAlert(true);
  } catch (error) {
    console.error("❌ Error saving quote:", error);
  }
};





const handleMouseEnter = (event, message) => {
  const rect = event.target.getBoundingClientRect();
  setTooltipPosition({
    x: rect.left + window.scrollX + 20, // Adjust to position tooltip to the right
    y: rect.top + window.scrollY - 10, // Adjust to position tooltip slightly above
  });
  setHoveredInfo(message);
};


const validateForm = () => {
  let errors = {};

  // ✅ Ensure product, category, fabric selection, and color are chosen before validating width/height
  // eslint-disable-next-line
  const isSelectionComplete = selectedCategory && selectedProduct && selectedFabricOption && selectedFabricColorOption;

  // ✅ Validate Customer Information (Always Required)
  if (!customerName.trim()) errors.customerName = "Customer name is required.";
  if (!sidemark.trim()) errors.sidemark = "Sidemark is required.";
  if (!address.trim()) errors.address = "Address is required.";
  if (!phoneNumber.trim()) errors.phoneNumber = "Phone Number is required.";
  if (
    !selectedOptions["Window Location"] ||
    selectedOptions["Window Location"].trim() === ""
  ) {
    errors["Window Location"] = "Window location is required.";
  }
  

 // ✅ Validate Width & Height ONLY After Category is Selected
 if (selectedCategory && selectedProduct) {
  if (isQuickShip) {
    if (!width || width === "") errors.width = "Width selection is required.";
    if (!height || height === "") errors.height = "Height selection is required.";
  } else {
    if (
      minMaxDimensions.minWidth !== null &&
      minMaxDimensions.maxWidth !== null &&
      minMaxDimensions.minHeight !== null &&
      minMaxDimensions.maxHeight !== null
    ) {
      const widthVal = (parseFloat(width) || 0) + calculateInches(0, widthFraction);
      const heightVal = (parseFloat(height) || 0) + calculateInches(0, heightFraction);
      
      if (widthVal < minMaxDimensions.minWidth || widthVal > minMaxDimensions.maxWidth) {
        errors.width = `Width must be between ${minMaxDimensions.minWidth} and ${minMaxDimensions.maxWidth} inches.`;
      }
      
      if (heightVal < minMaxDimensions.minHeight || heightVal > minMaxDimensions.maxHeight) {
        errors.height = `Height must be between ${minMaxDimensions.minHeight} and ${minMaxDimensions.maxHeight} inches.`;
      }
      
    }
  }
}
  // ✅ Validate Basic Product Information
  if (!selectedCategory) errors.selectedCategory = "Category is required.";
  if (!selectedProduct) errors.selectedProduct = "Product is required.";

  // ✅ Validate Fabric Selection Only If Needed
  if (fabricCollectionOptions.length > 0 && !selectedFabricOption) {
    errors.selectedFabricOption = "Fabric selection is required.";
  }
  if (fabricColorOptions.length > 0 && !selectedFabricColorOption) {
    errors.selectedFabricColorOption = "Fabric color is required.";
  }

  // ✅ Validate Mounting Position If Required
  const productsRequiringMountingPosition = [
    "Roller Shades",
    "2.5 Faux Wood Blinds",
    "2 Faux Wood Blinds",
    "Roman Shades",
    "Natural Shades",
    "Patio Shades"
  ];
  if (
    productsRequiringMountingPosition.includes(selectedProduct) &&
    (!selectedOptions["Mounting Position"] || selectedOptions["Mounting Position"].trim() === "")
  ) {
    errors["Mounting Position"] = "Mounting position is required.";
  }
  

  // ✅ Conditionally Require Control Position If Needed
  const requiresControlPosition = ["Loop Control", "Continuous Loop"];
  if (requiresControlPosition.includes(selectedOptions["Control Options"]) && !selectedOptions["Control Position"]) {
    errors["Control Position"] = "Control position is required.";
  }

  // ✅ Validate Liner Color If Required
  if (selectedOptions["Liner Options"] && selectedOptions["Liner Options"] !== "No Liner" && !selectedOptions["Liner Color"]) {
    errors["Liner Color"] = "Liner color is required.";
  }

  // ✅ Dynamically Validate Other Options Based on Product Type
  const productValidationRules = {
    "Roller Shades": ["Mounting Position", "Control Options", "Headbox Options"],
    "Roman Shades": ["Mounting Position", "Shade Styles", "Control Options", "Liner Options"],
    "Natural Shades": ["Mounting Position", "Shade Styles", "Control Options", "Liner Options"],
    "Quick Ship Panels": ["Pleat Styles", "Liner Options", "Window Opening Width"],
    "Composite Shutters": ["Tilt Options", "Hinge Color"],
    "Patio Shades": ["Control Options"],
  };

  // ✅ Validate Fascia Color when Metal Fascia is selected
  if (selectedOptions["Headbox Options"] === "Metal Fascia" && !selectedOptions["Fascia Color"]) {
    errors["Fascia Color"] = "Fascia color is required.";
  }

  // ✅ Require Hardware Options ONLY for Quick Ship Panels
  if (selectedProduct === "Quick Ship Panels" && !selectedOptions["Hardware Options"]) {
    errors["Hardware Options"] = "Hardware option is required.";
  }

  // ✅ Require Hardware Color IF Hardware Options is Selected
  if (selectedProduct === "Quick Ship Panels" && selectedOptions["Hardware Options"] && !selectedOptions["Hardware Color"]) {
    errors["Hardware Color"] = "Hardware color is required.";
  }

  // ✅ Require Finial Options ONLY when Hardware Options is Decorative Pole or Traverse Rod
  if (
    selectedOptions["Hardware Options"] === "Decorative Pole" || 
    selectedOptions["Hardware Options"] === "Traverse Rod"
  ) {
    if (!selectedOptions["Finial Options"] || selectedOptions["Finial Options"].trim() === "") {
      errors["Finial Options"] = "Finial option is required.";
    }
  } else {
    // ✅ Remove Finial Options error if Hardware Options is NOT Decorative Pole or Traverse Rod
    delete errors["Finial Options"];
  }

  // ✅ Check for required product options dynamically
  const requiredOptions = productValidationRules[selectedProduct] || [];
  requiredOptions.forEach((optionKey) => {
    if (!selectedOptions[optionKey]) {
      errors[optionKey] = `${optionKey} is required.`;
    }
  });

  // ✅ Validate Additional Options - Decorative Tape
  if (selectedOptions["Additional Options"] === "Decorative Tape" && !selectedOptions["Decorative Tape Type"]) {
    errors["Decorative Tape Type"] = "Please select a Decorative Tape Type.";
  }
  if (selectedOptions["Decorative Tape Type"] && !selectedOptions["Decorative Tape Color"]) {
    errors["Decorative Tape Color"] = "Please select a Decorative Tape Color.";
  }

  // ✅ LOG ERRORS BEFORE RETURNING
  if (Object.keys(errors).length > 0) {
    console.warn("⚠️ Validation Errors:", errors);
  }

 // ✅ Special Natural Shades Logic
if (selectedProduct === "Natural Shades") {
  
// ✅ Calculate full width and height including fractions

const widthVal =
  (parseFloat(width) || 0) + calculateInches(0, widthFraction);
const heightVal =
  (parseFloat(height) || 0) + calculateInches(0, heightFraction);

  const control = selectedOptions["Control Options"];
  const shadeStyle = selectedOptions["Shade Styles"];
  console.log("🛠 Control:", control, "| HeightVal:", heightVal, "| Product:", selectedProduct);


  // 2. Height limits by Control Options
  if (control?.toLowerCase().includes("cordless") && heightVal > 96) {
    errors.height = "Maximum height for Cordless Natural Shades is 96 inches.";
  }
  
  if (control === "Loop Control" && heightVal > 120) {
    errors.height = "Maximum height for Loop Control Natural Shades is 120 inches.";
  }

// 3. Top Down Bottom Up limitations for NATURAL SHADES only
if (
  selectedProduct === "Natural Shades" &&
  control === "Top Down Bottom Up"
) {
  if (widthVal > 72) {
    errors.width = "Maximum width for Top Down Bottom Up Natural Shades is 72 inches.";
  }
  if (heightVal > 72) {
    errors.height = "Maximum height for Top Down Bottom Up Natural Shades is 72 inches.";
  }

  const blockedFabrics = ["Sienna Hills", "Elysian", "Oslo Frost"];
  if (blockedFabrics.some((fabric) => selectedFabricOption?.includes(fabric))) {
    errors.selectedFabricOption = `${selectedFabricOption} is not available with Top Down Bottom Up.`;
  }
}


  // 4. Motorized height limits
  if (control === "Motorized") {
    if (heightVal < 36) {
      errors.height = "Minimum height for Motorized Natural Shades is 36 inches.";
    }
    if (heightVal > 96) {
      errors.height = "Maximum height for Motorized Natural Shades is 96 inches.";
    }
  }

  // 5. Hobbled Shade max dimensions
  if (shadeStyle === "Hobbled") {
    if (widthVal > 84) {
      errors.width = "Maximum width for Hobbled Natural Shades is 84 inches.";
    }
    if (heightVal > 96) {
      errors.height = "Maximum height for Hobbled Natural Shades is 96 inches.";
    }
  }
}
// ✅ Special Roller Shades Logic
if (selectedProduct === "Roller Shades") {
  const widthVal =
    (parseFloat(width) || 0) + calculateInches(0, widthFraction);
  const heightVal =
    (parseFloat(height) || 0) + calculateInches(0, heightFraction);

  const control = selectedOptions["Control Options"];

  // ✅ General Max Width Limit
  if (widthVal > 108) {
    errors.width = "Maximum width for Roller Shades is 108 inches.";
  }

  // ✅ Oversized Fee (optional visual flag or warning)
  if (widthVal > 90 && widthVal <= 108) {
    console.log("ℹ️ Oversized shade — $90 oversized fee may apply.");
    // Optional: set some warning state in your component
  }
// Inside validateForm()

if (
  selectedProduct === "Roller Shades" &&
  selectedOptions["Headbox Options"] &&
  !["Standard Open Roll", "Reverse Roll"].includes(selectedOptions["Headbox Options"])
) {
  const widthVal = (parseFloat(width) || 0) + calculateInches(0, widthFraction);
  const heightVal = (parseFloat(height) || 0) + calculateInches(0, heightFraction);

  if (widthVal > 84 || heightVal > 96) {
    errors["Headbox Options"] = "Only Standard Open Roll or Reverse Roll are allowed at this size.";
  }
}

  

  // ✅ Height limits based on Control Option
  if (control?.toLowerCase().includes("cordless") && heightVal > 96) {
    errors.height = "Maximum height for Cordless Roller Shades is 96 inches.";
  }

  if (control === "Continuous Loop" && heightVal > 144) {
    errors.height = "Maximum height for Continuous Loop Roller Shades is 144 inches.";
  }

  if (control === "Motorized" && heightVal > 144) {
    errors.height = "Maximum height for Motorized Roller Shades is 144 inches.";
  }
}





  // ✅ Set validation state
  setValidationErrors(errors);

  // ✅ Return errors object to be used in `handleSaveItem`
  return errors;
};
useEffect(() => {
  if (selectedProduct !== "Roller Shades" || !headboxOption) return;

  const widthVal = (parseFloat(width) || 0) + calculateInches(0, widthFraction);
  const heightVal = (parseFloat(height) || 0) + calculateInches(0, heightFraction);

  const isOversized = widthVal > 84 || heightVal > 96;
  const allowedOptions = ["Standard Open Roll", "Reverse Roll"];

  if (isOversized && !allowedOptions.includes(headboxOption)) {
    console.warn("⚠️ Invalid headbox option for dimensions. Resetting...");
    
    // Reset headbox option
    setHeadboxOption("");
    setSelectedOptions((prev) => ({
      ...prev,
      "Headbox Options": "",
    }));

    // ✅ Add validation error
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      "Headbox Options": "Selected headbox option is not valid for these dimensions.",
    }));
  }
}, [width, height, widthFraction, heightFraction, headboxOption, selectedProduct]);



// eslint-disable-next-line no-unused-vars
const handleSubmit = (e) => {
  e.preventDefault();
  if (validateForm()) {
    alert("Form submitted successfully!");
  } else {
    alert("Please fill out all required fields.");
  }
};

// eslint-disable-next-line no-unused-vars
const handleMouseLeave = () => {
  setTooltip({ visible: false, x: 0, y: 0 });
};


const handleQuantityChange = (e) => {
  let newQuantity = parseInt(e.target.value, 10);
  if (isNaN(newQuantity) || newQuantity < 1) {
    newQuantity = 1; // Ensure minimum quantity is 1
  }

  // ✅ Only update if the new quantity is different
  setQuantity((prevQuantity) => (prevQuantity !== newQuantity ? newQuantity : prevQuantity));
};

// eslint-disable-next-line
const handleAddMoreItems = () => {
  setShowAlert(false); // ✅ Close alert

  // ✅ Preserve quote ID and reset form fields
  const existingQuoteId = localStorage.getItem("currentQuoteId");
  if (existingQuoteId) {
    setCurrentQuoteId(existingQuoteId);
  }

  resetAllInputs(); // ✅ Reset form but keep the current quote
};




// eslint-disable-next-line no-unused-vars
const handleGoToQuote = () => {
  navigate(`/quote/${currentQuoteId}`);
};




const handleCategoryChange = (e) => {
  const newCategory = e.target.value;
  console.log("📌 Selected Category Changed:", newCategory);

  setSelectedCategory(newCategory);
  setSelectedProduct(""); // ✅ Reset product selection when category changes
  setFabricCollectionOptions([]); // ✅ Reset fabric options
  setFabricColorOptions([]);
  setValidationErrors({}); // ✅ Reset all validation errors
  resetAllInputs(); // ✅ Reset form selections
};

// Debug: Check if selectedCategory is actually changing
useEffect(() => {
  console.log("🚀 selectedCategory updated:", selectedCategory);
}, [selectedCategory]);




const handleProductChange = (e) => {
  const newProduct = e.target.value;
  setSelectedProduct(newProduct);
  setValidationErrors({}); 
  setIsQuickShip(newProduct === "Quick Ship Panels");

  // ✅ Reset only relevant options for the new product
  const newOptions = {};
  Object.keys(optionsData).forEach((optionCategory) => {
    if (optionsData[optionCategory].includes(newProduct)) {
      newOptions[optionCategory] = "";
    }
  });

  setSelectedOptions(newOptions);
  setQuantity(1); 
  setShowMotorizationOptions(false);
};


  
  
  
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initialSelectedOptions = {};
    Object.keys(optionsData).forEach((categoryKey) => {
      initialSelectedOptions[categoryKey] = '';  // Default value for each category
    });
    return initialSelectedOptions;
  });

  const handleOptionChange = async (category, newOption) => {
    setSelectedOptions((prevOptions) => {
      const updatedOptions = { ...prevOptions };
  
      /** ✅ HANDLE DROPDOWN OPTIONS **/
      if (category === "Control Options") {
        setShowMotorizationOptions(newOption === "Motorized");
  
        if (newOption !== "Motorized") {
          delete updatedOptions["Motorization Options"];
        } else {
          setTimeout(fetchMotorizationOptions, 0);
        }
  
        if (!["Loop Control", "Continuous Loop"].includes(newOption)) {
          delete updatedOptions["Control Position"];
        }
  
        if (selectedProduct === "Patio Shades") {
          delete updatedOptions["Handle Options"];
        }
  
        updatedOptions[category] = newOption;
        setQuantity(1); // Reset quantity
      }
  
      if (category === "Motorization Options") {
        const currentOptions = Array.isArray(prevOptions[category])
          ? prevOptions[category]
          : [];
  
        if (currentOptions.includes(newOption)) {
          updatedOptions[category] = currentOptions.filter(opt => opt !== newOption);
        } else {
          updatedOptions[category] = [...currentOptions, newOption];
        }
    
        const pricingData = sizeBasedPricingData[newOption];
        if (pricingData) {
          setSizeBasedPricing((prev) => ({
            ...prev,
            [newOption]: pricingData,
          }));
        }
  
        return updatedOptions; // 🛑 return early so other blocks don’t override array
      }
  
      if (category === "Liner Options") {
        updatedOptions["Liner Options"] = newOption;
        const shouldResetLinerColor =
          (["Roman Shades", "Quick Ship Panels"].includes(selectedProduct) &&
            !["Dimout Liner", "Standard Liner", "Blackout Liner"].includes(newOption)) ||
          (selectedProduct === "Natural Shades" &&
            !["Privacy Liner", "Blackout Liner"].includes(newOption));
  
        if (shouldResetLinerColor) {
          updatedOptions["Liner Color"] = "";
          setLinerColor("");
        }
      }
  
      if (category === "Hardware Options") {
        updatedOptions["Hardware Options"] = newOption;
  
        if (["Decorative Pole", "Traverse Rod"].includes(newOption)) {
          if (!updatedOptions["Finial Options"]) {
            updatedOptions["Finial Options"] = "";
          }
        } else {
          delete updatedOptions["Finial Options"];
        }

        
  
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          if (newOption) delete newErrors["Hardware Options"];
          if (!["Decorative Pole", "Traverse Rod"].includes(newOption)) {
            delete newErrors["Finial Options"];
          }
          return newErrors;
        });
      }
  
      if (category === "Headbox Options") {
        if (newOption === "Metal Fascia") {
          updatedOptions["Fascia Color"] = "";
        } else {
          delete updatedOptions["Fascia Color"];
        }
  
        updatedOptions["Headbox Options"] = newOption;
      }
  
      if (category === "Additional Options") {
        updatedOptions["Additional Options"] = newOption;
        if (newOption !== "Decorative Tape") {
          delete updatedOptions["Decorative Tape Type"];
          delete updatedOptions["Decorative Tape Color"];
        }
      }
  
      if (category === "Decorative Tape Type") {
        updatedOptions["Decorative Tape Type"] = newOption;
        if (!newOption) {
          delete updatedOptions["Decorative Tape Color"];
        }
      }
  
      if (category === "Handle Options") {
        updatedOptions["Handle Options"] = newOption;
      }
  
      // ✅ Default dropdown assignment
      if (
        ![
          "Control Options",
          "Motorization Options",
          "Liner Options",
          "Hardware Options",
          "Headbox Options",
          "Additional Options",
          "Decorative Tape Type",
          "Handle Options",
        ].includes(category)
      ) {
        updatedOptions[category] = newOption;
      }
  
      return updatedOptions;
    });
  
    /** ✅ FETCH MOTORIZATION OPTIONS WHEN MOTORIZED SELECTED **/
    if (category === "Control Options" && newOption === "Motorized") {
      try {
        const selectedProductData = productsData.find(p => p.name === selectedProduct);
        if (!selectedProductData?.optionRefs) return;
  
        const optionDocs = await Promise.all(
          selectedProductData.optionRefs.map((ref) => getDoc(ref))
        );
  
        const motorizationOptions = optionDocs
          .filter((doc) => doc.exists() && doc.data().optionCategory === "Motorization Options")
          .map((doc) => doc.data().optionName);
  
        setOptionsData((prev) => ({
          ...prev,
          "Motorization Options": motorizationOptions,
        }));
      } catch (err) {
        console.error("❌ Failed to fetch motorization options:", err);
      }
    }
  
    /** ✅ Load pricing data if available **/
    if (sizeBasedPricingData[newOption]) {
      setSizeBasedPricing((prev) => ({
        ...prev,
        [newOption]: sizeBasedPricingData[newOption] || {},
      }));
    }
  };
  
  // Load basic item once:
useEffect(() => {
  const fetchItem = async () => {
    if (!quoteId || !isEditMode) return;

    const quoteRef = doc(db, "quotes", quoteId);
    const quoteSnap = await getDoc(quoteRef);
    if (!quoteSnap.exists()) return;

    const quoteData = quoteSnap.data();
    const fetchedItem = quoteData.items[numericEditItemIndex];

    if (fetchedItem) {
      setItemToEdit(fetchedItem);
      // Prefill immediate customer info
      setCustomerName(quoteData.customerName || "");
      setPoNumber(quoteData.poNumber || "");
      setSidemark(quoteData.sidemark || "");
      setAddress(quoteData.address || "");
      setPhoneNumber(quoteData.phoneNumber || "");
      setSelectedCategory(fetchedItem.category || "");
    } else {
      console.warn("No item found at numericEditItemIndex");
    }
  };
  fetchItem();
}, [quoteId, numericEditItemIndex, isEditMode]);
// 🔁 Reset flags when editing a new item
useEffect(() => {
  if (quoteId && editItemIndex !== undefined) {
    setInitialPrefillComplete(false);
    setHasPrefilledProduct(false);
  }
}, [quoteId, editItemIndex]);

// 🚀 Prefill product and fetch option data immediately
useEffect(() => {
  if (itemToEdit && productsData.length > 0 && !hasPrefilledProduct) {
    const matchingProduct = productsData.find(p => p.name === itemToEdit.product);
    if (matchingProduct) {
      setSelectedProduct(itemToEdit.product || "");
      fetchOptions(matchingProduct.optionRefs); // Load product-specific options
    }

    // ⬇️ Pre-fill standard fields
    setWidth(itemToEdit.width || "");
    setWidthFraction(itemToEdit.widthFraction || "");
    setHeight(itemToEdit.height || "");
    setHeightFraction(itemToEdit.heightFraction || "");
    setQuantity(itemToEdit.quantity || 1);
    setSelectedFabricOption(itemToEdit.fabricOption || "");
    setSelectedFabricColorOption(itemToEdit.fabricColor || "");
    setWindowLocation(itemToEdit.windowLocation || "");
    setMountingPosition(itemToEdit.mountingPosition || "");

    // ⬇️ Build selectedOptions only with applicable keys
    const options = {
      ...(itemToEdit.mountingPosition && { "Mounting Position": itemToEdit.mountingPosition }),
      ...(itemToEdit.windowLocation && { "Window Location": itemToEdit.windowLocation }),
      ...(itemToEdit.linerOptions && { "Liner Options": itemToEdit.linerOptions }),
      ...(itemToEdit.linerColor && { "Liner Color": itemToEdit.linerColor }),
      ...(itemToEdit.controlOptions && { "Control Options": itemToEdit.controlOptions }),
      ...(itemToEdit.controlPosition && { "Control Position": itemToEdit.controlPosition }),
      ...(itemToEdit.shadeStyles && { "Shade Styles": itemToEdit.shadeStyles }),
      ...(itemToEdit.motorizationOptions && { "Motorization Options": itemToEdit.motorizationOptions }),
      ...(itemToEdit.decorativeTapeType && { "Decorative Tape Type": itemToEdit.decorativeTapeType }),
      ...(itemToEdit.decorativeTapeColor && { "Decorative Tape Color": itemToEdit.decorativeTapeColor }),
      ...(itemToEdit.additionalOptions && { "Additional Options": itemToEdit.additionalOptions }),
      ...(itemToEdit.hardwareOptions && { "Hardware Options": itemToEdit.hardwareOptions }),
      ...(itemToEdit.hardwareColor && { "Hardware Color": itemToEdit.hardwareColor }),
      ...(itemToEdit.headboxOptions && { "Headbox Options": itemToEdit.headboxOptions }),
      ...(itemToEdit.handleOptions && { "Handle Options": itemToEdit.handleOptions }),
      ...(itemToEdit.finialOptions && { "Finial Options": itemToEdit.finialOptions }),
      ...(itemToEdit.tiltOptions && { "Tilt Options": itemToEdit.tiltOptions }),
      ...(itemToEdit.fasciaColor && { "Fascia Color": itemToEdit.fasciaColor }),
      ...(itemToEdit.hingeColor && { "Hinge Color": itemToEdit.hingeColor }),
      ...(itemToEdit.pleatStyles && { "Pleat Styles": itemToEdit.pleatStyles }),
    };

    setSelectedOptions(options);

    // 🔁 Sync individual option states (if needed)
    setLinerOption(options["Liner Options"] || "");
    setLinerColor(options["Liner Color"] || "");
    setControlOption(options["Control Options"] || "");
    setControlPosition(options["Control Position"] || "");
    setShadeStyle(options["Shade Styles"] || "");
    setMotorizationOption(options["Motorization Options"] || []);
    setHardwareOption(options["Hardware Options"] || "");
    setPleatStyle(options["Pleat Styles"] || "");
    setHeadboxOption(options["Headbox Options"] || "");
    setFasciaColor(options["Fascia Color"] || "");
    setHingeColor(options["Hinge Color"] || "");

    setHasPrefilledProduct(true);
    setInitialPrefillComplete(true);
  }
}, [itemToEdit, productsData, hasPrefilledProduct]);

// 🔄 Keep control position in sync with selectedOptions
useEffect(() => {
  if (selectedOptions["Control Position"]) {
    setControlPosition(selectedOptions["Control Position"]);
  }
}, [selectedOptions]);

// ✅ Special logic to show liner color only for supported products + liner types
useEffect(() => {
  if (
    itemToEdit &&
    selectedProduct &&
    linerOption &&
    (
      (
        ["Roman Shades", "Quick Ship Panels"].includes(selectedProduct) &&
        ["Dimout Liner", "Standard Liner", "Blackout Liner"].includes(linerOption)
      ) ||
      (
        selectedProduct === "Natural Shades" &&
        ["Privacy Liner", "Blackout Liner"].includes(linerOption)
      )
    )
  ) {
    setLinerColor(itemToEdit.linerColor || "");
  }
}, [itemToEdit, selectedProduct, linerOption]);




  

  
const handleUpdateItem = async () => {
  const errors = validateForm(); // ✅ Reuse same validation
  if (Object.keys(errors).length > 0) {
    console.warn("🚨 Validation failed. Fix errors before updating.", errors);
    setValidationErrors(errors); // ✅ Show validation errors in UI
    return;
  }
  const quoteRef = doc(db, "quotes", quoteId);
  const quoteSnap = await getDoc(quoteRef);

  if (!quoteSnap.exists()) return;

  const quoteData = quoteSnap.data();
  const items = [...(quoteData.items || [])];

  const updatedItem = {
    customerName,
    poNumber,
    sidemark,
    address,
    phoneNumber,
    category: selectedCategory,
    product: selectedProduct,
    fabricOption: selectedFabricOption || "N/A",
    fabricColor: selectedFabricColorOption || "N/A",
    width,
    widthFraction,
    height,
    heightFraction,
    quantity,
    controlOptions: selectedOptions["Control Options"] || "N/A",
    controlPosition: controlPosition || "N/A",
    mountingPosition: mountingPosition || "N/A",
    windowLocation: windowLocation || "N/A",
    hardwareColor: hardwareColor || "N/A",
    finialOptions: finialOption || "N/A",
    tiltOptions: tiltOption || "N/A",
    hingeColor: hingeColor || "N/A",
    linerOptions: linerOption || "N/A",
    linerColor: resolvedLinerColor,
    
    shadeStyles: shadeStyle || "N/A",
    pleatStyles: pleatStyle || "N/A",
    motorizationOptions: Array.isArray(selectedOptions["Motorization Options"])
    ? selectedOptions["Motorization Options"]
    : [],
  
  
    handleOptions: handleOption || "N/A",
    headboxOptions: headboxOption || "N/A",
    fasciaColor: fasciaColor || "N/A",
    hardwareOptions:
      selectedProduct === "Quick Ship Panels"
        ? hardwareOption || "N/A"
        : "N/A",
    additionalOptions: additionalOptions || "N/A",
    decorativeTapeType: decorativeTapeType || "N/A",
    decorativeTapeColor: decorativeTapeColor || "N/A",
    totalPrice: Math.round(totalPrice),
    suggestedRetailPrice: Math.round(suggestedRetailPrice),
  };

  items[editItemIndex] = updatedItem;

  await updateDoc(quoteRef, { items });

  setAlertMessage("Your item has been updated successfully.");
  setShowAlert(true);

  navigate(`/quote/${quoteId}`);
};


  // Function to update the selected option for a category
const [selectedOption] = useState(null);
    useEffect(() => {
      // Ensure all necessary values are available
      if (selectedOption && selectedSize && sizeBasedPricingData) {
        const price = fetchSizeBasedPricing(selectedOption, selectedSize, sizeBasedPricingData);
        // Do something with the fetched price, like updating the state
        setTotalPrice(price);  // Assuming `setTotalPrice` is a state setter for the total price
      }
    }, [selectedOption, selectedSize, sizeBasedPricingData]);  // Trigger effect when any of these dependencies change

  // Function to reset all inputs
  const resetAllInputs = () => {
    setSelectedProduct("");
    setSelectedFabricOption("");
    setSelectedFabricColorOption("");
    setWidth("");
    setHeight("");
    setWidthFraction("");
    setHeightFraction("");
    setQuantity(1);
    setTotalPrice(0);
    setSelectedOptions({});
    setSizeBasedPricing({});
    setValidationErrors({});
    setFabricCollectionOptions([]);
    setFabricColorOptions([]);
  
  
    // ✅ Preserve fabricCollectionOptions if a product is still selected
    if (!selectedProduct) {
      setFabricCollectionOptions([]); 
    }
  
    setFabricColorOptions([]);
    setPricingRules(new Map());
  
    // Reset selected options but keep product & category
    setSelectedOptions({});
    setSizeBasedPricing({});
  };
  
// Function to fetch the options from Firestore based on the optionRefs// Function to fetch the options from Firestore based on the optionRefs
const fetchOptions = async (optionRefs) => {
  console.log('Fetching options data for optionRefs:', optionRefs);

  if (!optionRefs || !Array.isArray(optionRefs) || optionRefs.length === 0) {
    console.log('No valid optionRefs provided, returning early.');
    setOptionsData({});
    return;
  }

  try {
    console.log('Batch fetching option documents from Firestore...');

    // Convert optionRefs (document references) into queries for batch fetching
    const optionDocs = await Promise.all(optionRefs.map(optionRef => getDoc(optionRef))); 

    // Filter out missing documents and format them
    const optionsData = optionDocs
      .filter(doc => doc.exists())
      .map(doc => ({ ...doc.data(), id: doc.id }));

    console.log('Fetched options data:', optionsData);

    // Group options by category
    const groupedOptions = optionsData.reduce((acc, option) => {
      const { optionCategory, optionName } = option;
      if (!acc[optionCategory]) {
        acc[optionCategory] = [];
      }
      acc[optionCategory].push(optionName);
      return acc;
    }, {});

    console.log('Grouped options by category:', groupedOptions);
    setOptionsData(groupedOptions);

    // Store size-based pricing separately
    const sizeBasedPricingData = optionsData.reduce((acc, option) => {
      acc[option.optionName] = option.sizeBasedPricing || {};
      return acc;
    }, {});

    console.log('Size-based pricing data:', sizeBasedPricingData);
    setSizeBasedPricingData(sizeBasedPricingData);
  } catch (error) {
    console.error('Error fetching options from Firestore:', error);
  }
};

useEffect(() => {
  console.log("💰 Full sizeBasedPricing Map:", sizeBasedPricing);
}, [sizeBasedPricing]);


useEffect(() => {
  if (!selectedCategory) {
    console.warn("🚨 No category selected. Skipping product fetch.");
    return;
  }

  const fetchData = async () => {
    try {
      console.log("📌 Fetching products for category:", selectedCategory);

      const productsRef = collection(db, "products");
      const q = query(productsRef, where("category", "==", selectedCategory));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn("⚠️ No products found for:", selectedCategory);
        setProducts([]); // ✅ Keep this, but ensure it doesn’t break state
        return;
      }

      const fetchedProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("✅ Fetched Products:", fetchedProducts);

      setProducts(fetchedProducts); // ✅ Ensure state updates properly
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  fetchData();
}, [selectedCategory]);


// ✅ Check if products state updates correctly
useEffect(() => {
  console.log("📌 Updated Products State:", products);
}, [products]);


// Fetch products based on selected category
useEffect(() => {
  const fetchData = async () => {
    if (!selectedCategory) return;

    // Reset options data when the category changes
    setOptionsData({});

    try {
      console.log('Fetching products for category:', selectedCategory);

      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('category', '==', selectedCategory));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No products found for the selected category');
        setProducts([]);
        return;
      }

      const fetchedProducts = querySnapshot.docs.map((doc) => doc.data());
      const uniqueProducts = [
        ...new Map(fetchedProducts.map((product) => [product.name, product])).values(),
      ];
      setProducts(uniqueProducts);

      const allProductsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          productId: doc.id,
          name: data.name,
          fabricCollectionOptions: data.fabricCollectionOptions || [],
          fabricColorOptions: Array.isArray(data.fabricColorOptions) ? data.fabricColorOptions : [],
          pricingRules: data.pricingRules || {},
          optionRefs: data.options || [],
        };
      });

      setProductsData(allProductsData);

      // 🔥🔥 THIS is the key: ensure you fetch options if editing a product and there's no selected fabric yet
      const selectedProductData = allProductsData.find((prod) =>
        selectedFabricOption
          ? prod.fabricCollectionOptions.includes(selectedFabricOption)
          : prod.name === selectedProduct
      );

      if (selectedProductData?.optionRefs?.length > 0) {
        console.log('Fetching options for:', selectedProductData.name);
        await fetchOptions(selectedProductData.optionRefs);
      } else {
        console.log('⚠️ No product match found to fetch optionRefs for.');
      }
    } catch (error) {
      console.error('❌ Error fetching products data:', error);
    }
  };

  fetchData();
}, [selectedCategory, selectedFabricOption, selectedProduct]); // ✅ Add selectedProduct here


const fetchMotorizationOptions = async () => {
  if (!selectedProduct) return;

  // Find the selected product's data
  const selectedProductData = productsData.find((prod) => prod.name === selectedProduct);
  if (!selectedProductData || !selectedProductData.optionRefs) return;

  console.log("📌 Fetching Motorization Options for:", selectedProduct);

  try {
    // Fetch option documents from Firestore
    const optionDocs = await Promise.all(
      selectedProductData.optionRefs.map((optionRef) => getDoc(optionRef))
    );

    // Filter out only Motorization Options
    const motorizationOptions = optionDocs
      .filter(
        (docSnap) =>
          docSnap.exists() && docSnap.data().optionCategory === "Motorization Options"
      )
      .map((docSnap) => ({
        id: docSnap.id,
        optionName: docSnap.data().optionName,
        sizeBasedPricing: docSnap.data().sizeBasedPricing || {},
      }));

    console.log("🔍 Motorization Options Found:", motorizationOptions);

    // ✅ Store Motorization Options for selection
    setOptionsData((prevOptions) => ({
      ...prevOptions,
      "Motorization Options": motorizationOptions.map((opt) => opt.optionName),
    }));

    // ✅ Store size-based pricing for motorization options
    const pricingMap = motorizationOptions.reduce((acc, option) => {
      acc[option.optionName] = option.sizeBasedPricing;
      return acc;
    }, {});

    console.log("💰 Storing Size-Based Pricing for Motorization:", pricingMap);
    setSizeBasedPricingData((prev) => ({
      ...prev,
      ...pricingMap, // Merge new motorization pricing data
    }));

  } catch (error) {
    console.error("❌ Error fetching motorization options:", error);
  }
};



// Fetch size-based pricing for a specific selected option and size
const fetchSizeBasedPricing = (selectedOption, selectedSize, sizeBasedPricingData) => {
  if (!selectedOption || !selectedSize || !sizeBasedPricingData[selectedOption]) {
    return null;
  }
  return sizeBasedPricingData[selectedOption]?.[selectedSize] || null;
};

// eslint-disable-next-line no-unused-vars
const nonMotorizationOptions = Object.keys(selectedOptions).filter(
  (option) => !optionsData["Motorization Options"]?.includes(option)
);


// ✅ Calculate total price including motorization accessories
// ✅ Calculate total price including motorization accessorie



useEffect(() => {
  if (!selectedCategory || !selectedProduct) return;

  const selectedCategoryProducts = productsData.filter(product => product.name === selectedProduct);

  const allFabricCollectionOptions = new Set();
  selectedCategoryProducts.forEach((product) => {
    product.fabricCollectionOptions.forEach((option) => {
      allFabricCollectionOptions.add(option);
    });
  });

  setFabricCollectionOptions([...allFabricCollectionOptions]);
  console.log('Fabric Collection Options:', [...allFabricCollectionOptions]);
}, [selectedProduct, selectedCategory, productsData]);

useEffect(() => {
  if (!totalPrice || !costFactor || isNaN(costFactor) || costFactor === 0) return;

  const retailPrice = totalPrice / costFactor;
  setSuggestedRetailPrice(retailPrice);
}, [totalPrice, costFactor]);


  // Function to fetch pricing rules based on productId and selected fabricCollectionOption
  const fetchPricingRules = async (selectedProductData) => {
    try {
      const pricingDocRef = selectedProductData.pricingRules;
      const pricingDocSnapshot = await getDoc(pricingDocRef);
  
      if (!pricingDocSnapshot.exists()) {
        console.error('No pricing rules document found for selected product');
        return;
      }
  
      const pricingData = pricingDocSnapshot.data();
  
      if (pricingData && pricingData.widthHeightPricing) {
        let rulesArray = [];
  
        if (Array.isArray(pricingData.widthHeightPricing)) {
          rulesArray = pricingData.widthHeightPricing.map((rule) => ({
            dimension: rule.dimension,
            price: rule.price,
          }));
        } else {
          rulesArray = Object.entries(pricingData.widthHeightPricing).map(([dimension, price]) => ({
            dimension,
            price,
          }));
        }
  
        const pricingMap = new Map(rulesArray.map(rule => [rule.dimension, rule.price]));
        setPricingRules(pricingMap);
  
        // ✅ Ensure proper min/max dimensions
        const updatedMinMax = rulesArray.reduce((acc, rule) => {
          const [width, height] = rule.dimension.split('x').map(Number);
          if (!isNaN(width) && !isNaN(height)) {
            acc.minWidth = Math.min(acc.minWidth, width);
            acc.maxWidth = Math.max(acc.maxWidth, width);
            acc.minHeight = Math.min(acc.minHeight, height);
            acc.maxHeight = Math.max(acc.maxHeight, height);
          }
          return acc;
        }, {
          minWidth: Infinity,
          maxWidth: -Infinity,
          minHeight: Infinity,
          maxHeight: -Infinity,
        });
  
        // ✅ Set default values if no dimensions found
        setMinMaxDimensions({
          minWidth: isFinite(updatedMinMax.minWidth) ? updatedMinMax.minWidth : 24,
          maxWidth: isFinite(updatedMinMax.maxWidth) ? updatedMinMax.maxWidth : 120,
          minHeight: isFinite(updatedMinMax.minHeight) ? updatedMinMax.minHeight : 24,
          maxHeight: isFinite(updatedMinMax.maxHeight) ? updatedMinMax.maxHeight : 120,
        });
  
        console.log('✅ Updated Min/Max Dimensions:', updatedMinMax);
      } else {
        console.error('widthHeightPricing not found or incorrectly formatted');
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    }
  };
  
  useEffect(() => {
    const widthInches = isNaN(parseFloat(width)) ? 0 : parseFloat(width) + calculateInches(0, widthFraction);
  
    if (widthInches < minMaxDimensions.minWidth || widthInches > minMaxDimensions.maxWidth) {
      setValidationErrors((prev) => ({
        ...prev,
        width: `Width must be between ${minMaxDimensions.minWidth} and ${minMaxDimensions.maxWidth} inches.`,
      }));
    } else {
      setValidationErrors((prev) => {
        if (prev.width) return { ...prev, width: "" }; // ✅ Remove error when valid
        return prev;
      });
    }
  }, [width, widthFraction, minMaxDimensions]);
  
  useEffect(() => {
    const heightInches = isNaN(parseFloat(height)) ? 0 : parseFloat(height) + calculateInches(0, heightFraction);
  
    if (heightInches < minMaxDimensions.minHeight || heightInches > minMaxDimensions.maxHeight) {
      setValidationErrors((prev) => ({
        ...prev,
        height: `Height must be between ${minMaxDimensions.minHeight} and ${minMaxDimensions.maxHeight} inches.`,
      }));
    } else {
      setValidationErrors((prev) => {
        if (prev.height) return { ...prev, height: "" }; // ✅ Remove error when valid
        return prev;
      });
    }
  }, [height, heightFraction, minMaxDimensions]);
  


  useEffect(() => {
    if (!selectedProduct || pricingRules.size === 0) return;
  
    const widthInches = parseFloat(width || 0) + calculateInches(0, widthFraction);
    const heightInches = parseFloat(height || 0) + calculateInches(0, heightFraction);
  
    const roundedWidth = Math.ceil(widthInches / 12) * 12;
    const roundedHeight = Math.ceil(heightInches / 12) * 12;
    const dimensionKey = `${roundedWidth}x${roundedHeight}`;
  
    const basePrice = pricingRules.get(dimensionKey);
    if (basePrice === undefined) {
      console.warn("❌ No base price for dimensions:", dimensionKey);
      setTotalPrice(0);
      return;
    }
  
    let basePriceTotal = 0;
    let accessoryTotal = 0;
    let tariffTotal = 0;
  
    const basePriceCategories = [
      "Control Options", "Liner Options", "Shade Styles", "Tilt Options", "Headbox Options"
    ];
  
    const accessoryCategories = [
      "Hardware Options", "Hardware Color", "Finial Options", "Motorization Options", "Handle Options"
    ];
  
    Object.entries(selectedOptions).forEach(([categoryKey, selectedValue]) => {
      if (!selectedValue) return;
  
      // Handle Motorization Options array
      if (categoryKey === "Motorization Options" && Array.isArray(selectedValue)) {
        selectedValue.forEach((motorOption) => {
          const pricingData = sizeBasedPricingData[motorOption] || sizeBasedPricing[motorOption];
          const price = typeof pricingData === "number" 
            ? pricingData 
            : pricingData?.[dimensionKey] || 0;
  
          accessoryTotal += price;
  
// Apply appropriate tariffs by product type
if (selectedProduct.includes("Roller Shade") || selectedProduct.includes("Natural Shade")) {
  tariffTotal += price * 0.10;
} else if (
  selectedProduct.includes("Shutter") ||
  selectedProduct.includes("Roman Shade") ||
  selectedProduct.includes("Quick Ship Panel")
) {
  tariffTotal += price * 0.20;
}

        });
        return;
      }
  
      // Handle single option (not array)
      const pricingData = sizeBasedPricingData[selectedValue] || sizeBasedPricing[selectedValue];
      const price = typeof pricingData === "number" 
        ? pricingData 
        : pricingData?.[dimensionKey] || 0;
  
      if (basePriceCategories.includes(categoryKey)) {
        basePriceTotal += price;
      } else if (accessoryCategories.includes(categoryKey)) {
        accessoryTotal += price;
      }
    });
  
    // Base calculation
    let subtotal = (basePrice + basePriceTotal) * quantity * costFactor;
    let finalTotal = subtotal + (accessoryTotal * costFactor);
  
    // Add Roller Shade motor tariff if applicable
    if (selectedProduct.includes("Roller Shade") && selectedOptions["Control Options"] === "Motorized") {
      tariffTotal += subtotal * 0.10;
    }
  
    finalTotal += tariffTotal;
  
    setTotalPrice(finalTotal);
      }, [
    selectedProduct,
    selectedOptions,
    width, height,
    widthFraction, heightFraction,
    pricingRules,
    sizeBasedPricing, sizeBasedPricingData,
    quantity, costFactor
  ]);
  
  
  useEffect(() => {
    setFabricColorOptions([]);
    setPricingRules(new Map());
  
    if (!selectedFabricOption || !selectedProduct) return;
  
    // 🔍 Step 1: Find the selected product in productsData
    const selectedProductData = productsData.find(
      (product) =>
        product.name === selectedProduct &&
        product.fabricCollectionOptions.includes(selectedFabricOption)
    );
  
    if (!selectedProductData) {
      console.error("❌ Selected product not found for the fabric option.");
      return;
    }
  
    // ✅ Step 2: Set fabric color options
    const fabricColorOptionsData = selectedProductData.fabricColorOptions || [];
    setFabricColorOptions(fabricColorOptionsData);
  
    console.log(
      fabricColorOptionsData.length > 0
        ? "🎨 Fabric Color Options Loaded:"
        : "⚠️ No fabric color options found for this product.",
      fabricColorOptionsData
    );
  
    // ✅ Step 3: Fetch pricing rules for this product
    fetchPricingRules(selectedProductData);
  }, [selectedProduct, selectedFabricOption, productsData]);
  



  // Calculate the fractional inch value (used in width and height calculations)
  const calculateInches = (inches, fraction) => {
    if (fraction === '') return inches;
    const fractionMap = {
      '1/8': 1 / 8,
      '1/4': 1 / 4,
      '3/8': 3 / 8,
      '1/2': 1 / 2,
      '5/8': 5 / 8,
      '3/4': 3 / 4,
      '7/8': 7 / 8,
    };
    return inches + (fractionMap[fraction] || 0);
  };


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

  return (
<div className="product-config-container">
  
{/* Customer Information Section */}
<div className="customer-column-container">
  <h3>Customer Information</h3>
  <div className="customer-column-form">

    {/* Customer Name */}
    <label className="customer-column-label">
      Customer Name:
      <input
        type="text"
        className={`customer-column-input ${validationErrors.customerName ? "error-border" : ""}`}
        value={customerName}
        onChange={(e) => {
          setCustomerName(e.target.value);
          setValidationErrors((prev) => ({
            ...prev,
            customerName: e.target.value.trim() ? "" : "Customer name is required.",
          }));
        }}
        placeholder="Enter customer name"
      />
    </label>
    {validationErrors.customerName && <p className="error-text">{validationErrors.customerName}</p>}

  
    {/* Sidemark */}
    <label className="customer-column-label">
      Sidemark:
      <input
        type="text"
        className={`customer-column-input ${validationErrors.sidemark ? "error-border" : ""}`}
        value={sidemark}
        onChange={(e) => {
          setSidemark(e.target.value);
          setValidationErrors((prev) => ({
            ...prev,
            sidemark: e.target.value.trim() ? "" : "Sidemark is required.",
          }));
        }}
        placeholder="Enter sidemark"
      />
    </label>
    {validationErrors.sidemark && <p className="error-text">{validationErrors.sidemark}</p>}

    {/* Address */}
    <label className="customer-column-label">
      Address:
      <input
        type="text"
        className={`customer-column-input ${validationErrors.address ? "error-border" : ""}`}
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          setValidationErrors((prev) => ({
            ...prev,
            address: e.target.value.trim() ? "" : "Address is required.",
          }));
        }}
        placeholder="Enter address"
      />
    </label>
    {validationErrors.address && <p className="error-text">{validationErrors.address}</p>}

    {/* Phone Number */}
    <label className="customer-column-label">
      Phone Number:
      <input
        type="text"
        className={`customer-column-input ${validationErrors.phoneNumber ? "error-border" : ""}`}
        value={phoneNumber}
        onChange={(e) => {
          setPhoneNumber(e.target.value);
          setValidationErrors((prev) => ({
            ...prev,
            phoneNumber: e.target.value.trim() ? "" : "Phone number is required.",
          }));
        }}
        placeholder="Enter phone number"
      />
    </label>
    {validationErrors.phoneNumber && <p className="error-text">{validationErrors.phoneNumber}</p>}
    
  </div>
</div>
    
    {/* Left Column for Product Configuration */}
    <div className="product-column">
      <h2 className="title">Quoting Details</h2>
      {/* Your existing form fields */}
  


      <label className="form-label">
  Select Category:
  <select
    data-testid="category-select"
    className={`form-select ${validationErrors.selectedCategory ? "error" : ""}`}
    value={selectedCategory}
    onChange={handleCategoryChange}
  >
    <option value="">Select Category</option>
    {categories.length > 0 ? (
      categories.sort().map((category, index) => (
        <option key={index} value={category}>
          {category}
        </option>
      ))
    ) : (
      <option disabled>No categories available</option>
    )}
  </select>
</label>



  
<label className="form-label">
  Select Product:
  <select
    data-testid="product-select"
    className={`form-select ${validationErrors.selectedProduct ? "error" : ""}`}
    value={selectedProduct}
    onChange={handleProductChange}
    disabled={products.length === 0}
  >
    <option value="">Select Product</option>
    {products.length > 0 ? (
      products
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((product) => (
          <option key={product.id} value={product.name}>
            {formatProductName(product.name)}
          </option>
        ))
    ) : (
      <option disabled>No products available</option>
    )}
  </select>

  {validationErrors.selectedProduct && (
    <p className="error-text">{validationErrors.selectedProduct}</p>
  )}
</label>





  
{/* Select Fabric OR Color (Dynamic) */}
{fabricCollectionOptions.length > 0 && (
  <div className="dropdown-container">
<label htmlFor="fabric-option" className="form-label">
  {["Blinds", "Shutters"].includes(selectedCategory) ? "Select Color:" : "Select Fabric:"}
</label>
    <div className="dropdown-with-info">
      <select
        data-testid="color-select"
        className={`form-select ${validationErrors.selectedFabricOption ? "error" : ""}`}
        value={selectedFabricOption}
        onChange={(e) => {
          setSelectedFabricOption(e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            selectedFabricOption: e.target.value
              ? null
              : ["Blinds", "Shutters"].includes(selectedCategory)
              ? "Color selection is required."
              : "Fabric selection is required.",
          }));
        }}
      >
        <option value="">
      {["Blinds", "Shutters"].includes(selectedCategory) ? "Select Color" : "Select Fabric"}
    </option>
        {fabricCollectionOptions
          .sort((a, b) => a.localeCompare(b)) // ✅ SORTING ADDED
          .map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
      </select>

      {/* Info Button with Hover Tooltip */}
      <div
        className="info-button"
        onMouseEnter={(e) => handleMouseEnter(e, "See your samples for available colors and fabric options.")}
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>
    

    {/* Validation Error Message - Directly Below Dropdown */}
    {validationErrors.selectedFabricOption && (
      <p className="error-text">{validationErrors.selectedFabricOption}</p>
    )}
  </div>
  
)}




{/* Select Fabric Color */}
{fabricColorOptions.length > 0 && (
  <div className="dropdown-container">
    <label className="form-label">Select Fabric Color:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors.selectedFabricColorOption ? "error" : ""}`}
        value={selectedFabricColorOption || ""}
        onChange={(e) => {
          setSelectedFabricColorOption(e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            selectedFabricColorOption: e.target.value ? null : "Fabric color is required.",
          }));
        }}
      >
        <option value="">Select Color</option>
        {fabricColorOptions
          .sort((a, b) => a.localeCompare(b))
          .map((color, index) => (
            <option key={index} value={color}>
              {color}
            </option>
          ))}
      </select>




      {/* Info Button with Hover Tooltip */}
      <div
        className="info-button"
        onMouseEnter={(e) =>
          handleMouseEnter(e, "See your samples for available colors and fabric options.")
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>

          {/* Validation Error Message */}
          {validationErrors.selectedFabricColorOption && (
        <p className="error-text">{validationErrors.selectedFabricColorOption}</p>
      )}
  </div>
)}


  {/* 🔥 Tooltip for Hovered Info Buttons (Dynamically Positioned) */}
  {hoveredInfo && (
        <div
          className="tooltip"
          style={{
            position: "absolute",
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {hoveredInfo}
        </div>
      )} 
       
{/* Width Selection */}
<div className={isQuickShip ? "quickship-dimension-container" : "standard-dimension-container"}>
  <label className="form-label">{isQuickShip ? "Select Width:" : "Enter Width:"}</label>

  {isQuickShip ? (
    <>
      <select
        className={`width-dropdown ${validationErrors.width ? "error-border" : ""}`}
        value={width || ""}
        onChange={(e) => {
          setWidth(e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            width: e.target.value ? "" : "Width is required.",
          }));
        }}
      >
        <option value="">Select a Width</option>
        <option value="24">20"</option> {/* UI shows 20 but stores 24 */}
        <option value="40">40"</option>
      </select>

      {/* ✅ Show Validation Error */}
      {validationErrors.width && <p className="error-text">{validationErrors.width}</p>}
    </>
  ) : (
    <>
      <div className="dimension-input-wrapper">
        <input
          type="number"
          className={`width-input ${validationErrors.width ? "error-border" : ""}`}
          value={width || ""}
          onChange={(e) => {
            setWidth(e.target.value);
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              width: e.target.value ? "" : "Width is required.",
            }));
          }}
          placeholder="Width (inches)"
        />
        <select
          value={widthFraction || ""}
          onChange={(e) => setWidthFraction(e.target.value)}
          className="dimension-fraction"
        >
          <option value="">--</option>
          {fractions.map((fraction) => (
            <option key={fraction} value={fraction}>
              {fraction}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Show Validation Error */}
      {validationErrors.width && <p className="error-text">{validationErrors.width}</p>}
    </>
  )}
</div>



{/* Height Selection */}
<div className={isQuickShip ? "quickship-dimension-container" : "standard-dimension-container"}>
  <label className="form-label">{isQuickShip ? "Select Height:" : "Enter Height:"}</label>

  {isQuickShip ? (
    <>
      <select
        className={`height-dropdown ${validationErrors.height ? "error-border" : ""}`}
        value={height || ""}
        onChange={(e) => {
          setHeight(e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            height: e.target.value ? "" : "Height selection is required.",
          }));
        }}
      >
        <option value="">Select a Height</option>
        <option value="60">60"</option>
        <option value="72">72"</option>
        <option value="84">84"</option>
        <option value="96">96"</option>
        <option value="120">120"</option>
      </select>

      {/* ✅ Show Validation Error */}
      {validationErrors.height && <p className="error-text">{validationErrors.height}</p>}
    </>
  ) : (
    <>
      <div className="dimension-input-wrapper">
        <input
          type="number"
          className={`height-input ${validationErrors.height ? "error-border" : ""}`}
          value={height || ""}
          onChange={(e) => {
            const newHeight = e.target.value;
            setHeight(newHeight);

            // ✅ Only enforce min/max for standard products
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              height:
                !isQuickShip && (newHeight < minMaxDimensions.minHeight || newHeight > minMaxDimensions.maxHeight)
                  ? `Height must be between ${minMaxDimensions.minHeight} and ${minMaxDimensions.maxHeight} inches.`
                  : "",
            }));
          }}
          placeholder="Height (inches)"
        />
        <select
          value={heightFraction || ""}
          onChange={(e) => setHeightFraction(e.target.value)}
          className="dimension-fraction"
        >
          <option value="">--</option>
          {fractions.map((fraction) => (
            <option key={fraction} value={fraction}>
              {fraction}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Show Validation Error */}
      {validationErrors.height && <p className="error-text">{validationErrors.height}</p>}
    </>
  )}
</div>


{/* ✅ Conditionally show Pleat Styles if Quick Ship Panels is selected */}
{isQuickShip && (
  <div className="pleat-style-selection">
    <label className="form-label">Pleat Styles:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Pleat Styles"] ? "error" : ""}`}
        value={pleatStyle || ""}
        onChange={(e) => {
          setPleatStyle(e.target.value);
          handleOptionChange("Pleat Styles", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Pleat Styles": e.target.value ? null : "Pleat style selection is required.",
          }));
        }}
      >
        <option value="">Select Pleat Style</option>
        <option value="2-Finger Pinch Pleat">2-Finger Pinch Pleat</option>
        <option value="3-Finger Pinch Pleat">3-Finger Pinch Pleat</option>
        <option value="2-Finger Inverted Pinch Pleat">2-Finger Inverted Pinch Pleat</option>
        <option value="3-Finger Inverted Pinch Pleat">3-Finger Inverted Pinch Pleat</option>
        <option value="Back Tab">Back Tab</option>
        <option value="Rod Pocket">Rod Pocket</option>
      </select>

      {/* ✅ Info Button with Hover Tooltip */}
      <div
        className="info-button"
        onMouseEnter={(e) =>
          handleMouseEnter(
            e,
            "Pleat styles define the overall appearance of your drapery. For visual examples and more details, please refer to the product brochure available in the Resources tab."
          )
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>
    {/* Validation Error Message */}
    {validationErrors["Pleat Styles"] && <p className="error-text">{validationErrors["Pleat Styles"]}</p>}
  </div>
)}



{/* ✅ Mounting Position Dropdown (Hide when "Shutters" or "Quick Ship Panels" selected) */}
{selectedProduct !== "Quick Ship Panels" && selectedProduct !== "Composite Shutters" && (
  <div className="mounting-position-container">
    <label className="form-label">Mounting Position:</label>
    <div className="dropdown-with-info">
      <select
        data-testid="mounting-position-select"
        className={`form-select ${validationErrors["Mounting Position"] ? "error" : ""}`}
        value={mountingPosition || ""}
        onChange={(e) => {
          setMountingPosition(e.target.value);
          handleOptionChange("Mounting Position", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Mounting Position": e.target.value ? null : "Mounting position is required.",
          }));
        }}
      >
        <option value="">Select Mounting Position</option>
        <option value="Inside Mount">Inside Mount</option>
        <option value="Outside Mount">Outside Mount</option>
      </select>

      {/* ✅ Info Button with Hover Tooltip */}
      <div
        className="info-button"
        onMouseEnter={(e) =>
          handleMouseEnter(
            e,
            "Mounting position determines whether the treatment is installed inside the window frame or outside (commonly used for doors)."
          )
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>
    {/* Validation Error Message */}
    {validationErrors["Mounting Position"] && <p className="error-text">{validationErrors["Mounting Position"]}</p>}
  </div>
)}

{/* ✅ Window Location Input Field (Always Visible) */}
<div className="window-location-container">
  <label className="form-label">Window Location:</label>
  <input
    type="text"
    className={`form-input ${validationErrors["Window Location"] ? "error" : ""}`}
    value={windowLocation || ""}
    onChange={(e) => {
      setWindowLocation(e.target.value);
      handleOptionChange("Window Location", e.target.value);
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        "Window Location": e.target.value.trim() ? null : "Window location is required.",
      }));
    }}
    placeholder="(e.g., Living Room, Master Bedroom)"
  />

  {/* ✅ Validation Error Message (Styled Separately) */}
  {validationErrors["Window Location"] && (
    <p className="error-text window-location-error">{validationErrors["Window Location"]}</p>
  )}
</div>


{/* ✅ Window Opening Width (Only for Quick Ship Panels) */}
{selectedProduct === "Quick Ship Panels" && (
  <div className="window-opening-width-container">
    <label className="form-label">
      Window Opening Width:
      <input
        type="number"
        className={`form-input ${validationErrors["Window Opening Width"] ? "error" : ""}`}
        value={selectedOptions["Window Opening Width"] || ""}
        onChange={(e) => {
          handleOptionChange("Window Opening Width", e.target.value);

          // ✅ Remove error once valid input is provided
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (e.target.value.trim()) {
              delete newErrors["Window Opening Width"];
            }
            return newErrors;
          });
        }}
        placeholder="Enter Window Opening Width (inches)"
      />
    </label>

    {/* ✅ Validation Error Message */}
    {validationErrors["Window Opening Width"] && (
      <p className="error-text">{validationErrors["Window Opening Width"]}</p>
    )}
  </div>
)}


{/* 🎯 Render all options normally, EXCEPT explicitly excluded options */}
{Object.keys(optionsData).length > 0 && (
  <div className="form-container">
    {Object.entries(optionsData)
      .filter(([categoryKey]) => 
        !["Control Options", "Additional Options", "Hardware Options", "Liner Options", "Shade Styles", "Headbox Options", "Tilt Options"].includes(categoryKey)
      )
      .map(([categoryKey, options]) => {

        // ❌ Exclude "Motorization Options" (Handled Separately)
        if (categoryKey === "Motorization Options") return null;

        // ❌ Exclude "Handle Options" for Patio Shades
        if (selectedProduct === "Patio Shades" && categoryKey === "Handle Options") return null;

        // ❌ Exclude "Banding Options" for Natural Shades
        if (selectedProduct === "Natural Shades" && categoryKey === "Banding Options") return null;

        // ✅ Render all other options normally (sorted alphabetically)
        return (
          <div key={categoryKey} className="dropdown-container">
            <label className="form-label">
              {categoryKey}:
              <select
                className="form-select"
                value={selectedOptions[categoryKey] || ""}
                onChange={(e) => handleOptionChange(categoryKey, e.target.value)}
              >
                <option value="">Select Option</option>
                {options
                  .sort((a, b) => a.localeCompare(b))
                  .map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        );
      })}
  </div>
)}

{/* ✅ Tilt Options - Render Only If Available */}
{optionsData["Tilt Options"] && selectedProduct && (
  <div className="dropdown-container">
    <label className="form-label">Tilt Options:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Tilt Options"] ? "error" : ""}`}
        value={tiltOption || ""}
        onChange={(e) => {
          setTiltOption(e.target.value);
          handleOptionChange("Tilt Options", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Tilt Options": e.target.value ? null : "Tilt option is required.",
          }));
        }}
      >
        <option value="">Select Tilt Option</option>
        {optionsData["Tilt Options"]
          .sort((a, b) => a.localeCompare(b))
          .map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
      </select>

      {/* ✅ Info Button with Hover Tooltip */}
      <div
        className="info-button"
        onMouseEnter={(e) =>
          handleMouseEnter(
            e,
            "For visual examples and more details, please refer to the product brochure available in the Resources tab."
          )
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>
    {/* Validation Error Message */}
    {validationErrors["Tilt Options"] && (
      <p className="error-text">{validationErrors["Tilt Options"]}</p>
    )}
  </div>
)}

{/* ✅ Render Headbox Options Separately (Only for Roller Shades) */}
{selectedProduct === "Roller Shades" && optionsData["Headbox Options"] && (() => {
  const widthInches = parseFloat(width) + calculateInches(0, widthFraction);
  const heightInches = parseFloat(height) + calculateInches(0, heightFraction);

  const isOversized = widthInches > 84 || heightInches > 96;

  const allowedOptions = isOversized
    ? ["Standard Open Roll", "Reverse Roll"]
    : optionsData["Headbox Options"];

  return (
    <div className="dropdown-container">
      <label className="form-label">Headbox Options:</label>
      <div className="dropdown-with-info">
        <select
          className={`form-select ${validationErrors["Headbox Options"] ? "error" : ""}`}
          value={headboxOption || ""}
          onChange={(e) => {
            setHeadboxOption(e.target.value);
            handleOptionChange("Headbox Options", e.target.value);
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              "Headbox Options": e.target.value ? null : "Headbox option is required.",
            }));
          }}
        >
          <option value="">Select Headbox Option</option>
          {allowedOptions
            .sort((a, b) => a.localeCompare(b))
            .map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
        </select>

        <div
          className="info-button"
          onMouseEnter={(e) =>
            handleMouseEnter(
              e,
              "For visual examples and more details, please refer to the product brochure available in the Resources tab."
            )
          }
          onMouseLeave={() => setHoveredInfo(null)}
        >
          ?
        </div>
      </div>

      {validationErrors["Headbox Options"] && (
        <p className="error-text">{validationErrors["Headbox Options"]}</p>
      )}
    </div>
  );
})()}


{/* ✅ Conditional Fascia Color Dropdown (Only If Metal Fascia is Selected) */}
{headboxOption === "Metal Fascia" && (
  <div className="dropdown-container">
    <label className="form-label">Fascia Color:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Fascia Color"] ? "error" : ""}`}
        value={fasciaColor || ""}
        onChange={(e) => {
          setFasciaColor(e.target.value);
          handleOptionChange("Fascia Color", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Fascia Color": e.target.value ? null : "Fascia color is required when selecting Metal Fascia.",
          }));
        }}
      >
        <option value="">Select Fascia Color</option>
        <option value="Black">Black</option>
        <option value="Grey">Grey</option>
        <option value="Tan">Tan</option>
        <option value="White">White</option>
      </select>

      {/* ✅ Info Button with Hover Tooltip */}
      <div
        className="info-button"
        onMouseEnter={(e) =>
          handleMouseEnter(e, "Choose a Fascia Color for the Metal Fascia Headbox.")
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>

    {/* ✅ Validation Error Message (Displays when validation fails) */}
    {validationErrors["Fascia Color"] && (
      <p className="error-text">{validationErrors["Fascia Color"]}</p>
    )}
  </div>
)}
{/* ✅ Liner Options - Corrected */}
{optionsData["Liner Options"]?.length > 0 && selectedProduct && (
  <div className="liner-container">
    <label className="liner-label">Liner Options:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Liner Options"] ? "error" : ""}`}
        value={linerOption || ""}
        onChange={(e) => {
          setLinerOption(e.target.value);
          handleOptionChange("Liner Options", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Liner Options": e.target.value ? null : "Liner option is required.",
          }));
        }}
      >
        <option value="">Select Liner</option>
        {optionsData["Liner Options"]
          .sort((a, b) => a.localeCompare(b))
          .map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
      </select>
      <div
        className="info-button"
        onMouseEnter={(e) =>
          handleMouseEnter(
            e,
            "Liners affect privacy and light control. For visual examples and more details, please refer to the product brochure available in the Resources tab."
          )
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>
    {validationErrors["Liner Options"] && <p className="error-text">{validationErrors["Liner Options"]}</p>}
  </div>
)}



{/* Liner Color for Roman Shades & Quick Ship Panels */}
{["Roman Shades", "Quick Ship Panels"].includes(selectedProduct) &&
  ["Dimout Liner", "Standard Liner", "Blackout Liner"].includes(linerOption) && (
    <div className="dropdown-container">
      <label className="form-label">Liner Color:</label>
      <div className="dropdown-with-info">
        <select
          value={linerColor || ""}
          className={`form-select ${validationErrors["Liner Color"] ? "error" : ""}`}
          onChange={(e) => {
            setLinerColor(e.target.value);
            handleOptionChange("Liner Color", e.target.value);
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              "Liner Color": e.target.value ? null : "Liner color selection is required.",
            }));
          }}
        >
          <option value="">Select Liner Color</option>
          <option value="White">White</option>
          <option value="Off White">Off White</option>
        </select>
      </div>
      {validationErrors["Liner Color"] && <p className="error-text">{validationErrors["Liner Color"]}</p>}
    </div>
)}

{/* Liner Color for Natural Shades */}
{selectedProduct === "Natural Shades" &&
  ["Privacy Liner", "Blackout Liner"].includes(linerOption) && (
    <div className="dropdown-container">
      <label className="form-label">Liner Color:</label>
      <div className="dropdown-with-info">
        <select
          value={linerColor || ""}
          className={`form-select ${validationErrors["Liner Color"] ? "error" : ""}`}
          onChange={(e) => {
            setLinerColor(e.target.value);
            handleOptionChange("Liner Color", e.target.value);
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              "Liner Color": e.target.value ? null : "Liner color selection is required.",
            }));
          }}
        >
          <option value="">Select Liner Color</option>
          {["White", "Cream", "Teak", "Natural", "Gray"].map((color, idx) => (
            <option key={idx} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
      {validationErrors["Liner Color"] && <p className="error-text">{validationErrors["Liner Color"]}</p>}
    </div>
)}

{/* ✅ Shade Styles - Render Separately Only for Products That Have It */}
{optionsData["Shade Styles"] && selectedProduct && (
  <div className="dropdown-container">
    <label className="form-label">Shade Styles:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Shade Styles"] ? "error" : ""}`}
        value={shadeStyle || ""}
        onChange={(e) => {
          setShadeStyle(e.target.value);
          handleOptionChange("Shade Styles", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Shade Styles": e.target.value ? null : "Shade style is required.",
          }));
        }}
      >
        <option value="">Select Shade Style</option>
        {optionsData["Shade Styles"]
          .slice() // ✅ Make a copy before sorting (to prevent modifying the original array)
          .sort((a, b) => a.localeCompare(b)) // ✅ Alphabetical Sorting
          .map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
      </select>

      {/* ✅ Info Button with Hover Tooltip */}
      <div
        className="info-button"
        onMouseEnter={(e) =>
          handleMouseEnter(
            e,
            "Shade styles determine the overall look and functionality of your window treatment. For visual examples and more details, please refer to the product brochure available in the Resources tab."
          )
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>

    {/* Validation Error Message */}
    {validationErrors["Shade Styles"] && (
      <p className="error-text">{validationErrors["Shade Styles"]}</p>
    )}
  </div>
)}
{selectedProduct === "Natural Shades" ? (
  <div className="control-options-container">
    <label className="form-label">Control Options:</label>

    {(() => {
      const blockedFabrics = ["Sienna Hills", "Elysian", "Elysian Fog", "Oslo Frost"];
      const normalizedFabric = (selectedFabricOption || "").toLowerCase();

      const isBlockedFabric = blockedFabrics.some((fabric) =>
        normalizedFabric.includes(fabric.toLowerCase())
      );

      const filteredOptions = Array.isArray(optionsData["Control Options"])
        ? optionsData["Control Options"]
            .filter((opt) => {
              if (shadeStyle === "Hobbled") return opt === "Loop Control";
              if (isBlockedFabric) return opt !== "Top Down Bottom Up";
              return true;
            })
        : [];

      return (
        <select
          className={`form-select ${validationErrors["Control Options"] ? "error" : ""}`}
          value={selectedOptions["Control Options"] || ""}
          onChange={(e) => {
            handleOptionChange("Control Options", e.target.value);
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              "Control Options": e.target.value ? null : "Control option is required.",
            }));
          }}
        >
          <option value="">Select Option</option>
          {filteredOptions.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    })()}

    {validationErrors["Control Options"] && (
      <p className="error-text">{validationErrors["Control Options"]}</p>
    )}
  </div>
) : (
  // ✅ For non-Natural Shades
  optionsData["Control Options"]?.length > 0 && (
    <div className="control-options-container">
      <label className="form-label">Control Options:</label>
      <select
        className={`form-select ${validationErrors["Control Options"] ? "error" : ""}`}
        value={selectedOptions["Control Options"] || ""}
        onChange={(e) => {
          handleOptionChange("Control Options", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Control Options": e.target.value ? null : "Control option is required.",
          }));
        }}
      >
        <option value="">Select Option</option>
        {optionsData["Control Options"].map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>

      {validationErrors["Control Options"] && (
        <p className="error-text">{validationErrors["Control Options"]}</p>
      )}
    </div>
  )
)}


{/* ✅ Hardware Options Dropdown (Only for Quick Ship Panels) */}
{selectedProduct === "Quick Ship Panels" && optionsData["Hardware Options"] && (
  <div className="hardware-options-container">
    <label className="form-label">Hardware Options:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Hardware Options"] ? "error-border" : ""}`}
        value={hardwareOption || ""}
        onChange={(e) => {
          setHardwareOption(e.target.value);
          handleOptionChange("Hardware Options", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Hardware Options": e.target.value ? null : "Hardware option is required for Quick Ship Panels.",
            "Hardware Color": e.target.value ? prevErrors["Hardware Color"] : null,
          }));
        }}
      >
        <option value="">Select Hardware Option</option>
        {optionsData["Hardware Options"].map((option, idx) => {
          const renamedOption = {
            "Decorative Pole With Rings": "Decorative Pole",
            "French Return With Rings": "French Return",
            "Decorative Traverse Rod": "Traverse Rod",
          }[option] || option;

          return (
            <option key={idx} value={option}>
              {renamedOption}
            </option>
          );
        })}
      </select>

      {/* ✅ Info Button with Hover Tooltip */}
      <div
        className="info-button"
        onMouseEnter={(e) =>
          handleMouseEnter(
            e,
            "For visual examples and more details, please refer to the product brochure available in the Resources tab."
          )
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>

    {/* ✅ Show Validation Error Message */}
    {validationErrors["Hardware Options"] && (
      <p className="error-text">{validationErrors["Hardware Options"]}</p>
    )}
  </div>
)}



{/* ✅ Show "Control Position" dropdown only if "Loop Control" or "Continuous Loop" is selected */}
{["Loop Control", "Continuous Loop"].includes(selectedOptions["Control Options"]) && (
  <div className="control-position-container">
    <label className="form-label">Control Position:</label>
    <select
      className={`form-select ${validationErrors["Control Position"] ? "error" : ""}`}
      value={controlPosition || ""}
      onChange={(e) => {
        setControlPosition(e.target.value);
        handleOptionChange("Control Position", e.target.value);
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          "Control Position": e.target.value ? null : prevErrors["Control Position"],
        }));
      }}
    >
      <option value="">Select Control Position</option>
      <option value="Right Side">Right Side</option>
      <option value="Left Side">Left Side</option>
    </select>

    {/* Validation Error Message */}
    {validationErrors["Control Position"] && (
      <p className="error-text">{validationErrors["Control Position"]}</p>
    )}
  </div>
)}

{/* ✅ Motorization Options */}
{selectedOptions["Control Options"] === "Motorized" && (
  <div className="motorization-options">
    <h4>Motorization Options</h4>
    <div className="motorization-options-grid">
      {optionsData["Motorization Options"]?.map((option, idx) => (
        <label key={idx} className="motorization-checkbox">
          <input
            type="checkbox"
            checked={motorizationOption.includes(option)}
            onChange={() => {
              setMotorizationOption((prevOptions) => {
                if (prevOptions.includes(option)) {
                  return prevOptions.filter((opt) => opt !== option);
                } else {
                  return [...prevOptions, option];
                }
              });

              handleOptionChange("Motorization Options", option);
            }}
          />
          <span className="custom-checkbox"></span>
          {option}
        </label>
      ))}
    </div>

    {/* Validation Error Message */}
    {validationErrors["Motorization Options"] && (
      <p className="error-text">{validationErrors["Motorization Options"]}</p>
    )}
  </div>
)}


{/* ✅ Hardware Color Dropdown (Only shows for Quick Ship Panels if Hardware Option is selected) */}
{selectedProduct === "Quick Ship Panels" && hardwareOption && (
  <div className="hardware-color-container">
    <label className="form-label">
      Hardware Color:
      <select
        className={`form-select ${validationErrors["Hardware Color"] ? "error" : ""}`}
        value={hardwareColor || ""}
        onChange={(e) => {
          setHardwareColor(e.target.value);
          handleOptionChange("Hardware Color", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Hardware Color": e.target.value ? null : "Hardware color selection is required.",
          }));
        }}
      >
        <option value="">Select Color</option>
        <option value="Black">Black</option>
        <option value="Gold">Gold</option>
        <option value="Silver">Silver</option>
      </select>
    </label>

    {/* ✅ Show Validation Error */}
    {validationErrors["Hardware Color"] && <p className="error-text">{validationErrors["Hardware Color"]}</p>}
  </div>
)}

{/* ✅ Finial Options Dropdown (Conditional, only for Quick Ship Panels) */}
{selectedProduct === "Quick Ship Panels" &&
  hardwareOption &&
  !["French Return", "French Return With Rings", ""].includes(hardwareOption) && (
    <div className="finial-options-container">
      <label className="form-label">Finial Options:</label>
      <div className="dropdown-with-info">
        <select
          className={`form-select ${validationErrors["Finial Options"] ? "error" : ""}`}
          value={finialOption || ""}
          onChange={(e) => {
            setFinialOption(e.target.value);
            handleOptionChange("Finial Options", e.target.value);
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              "Finial Options": e.target.value ? null : "Finial option selection is required.",
            }));
          }}
        >
          <option value="">Select Finial Option</option>
          <option value="Ball">Ball</option>
          <option value="End Cap">End Cap</option>
          <option value="Faceted">Faceted</option>
          <option value="Fluted">Fluted</option>
          <option value="Square">Square</option>
          <option value="Trumpet">Trumpet</option>
        </select>

        {/* ✅ Info Button with Hover Tooltip */}
        <div
          className="info-button"
          onMouseEnter={(e) =>
            handleMouseEnter(
              e,
              "For visual examples and more details, please refer to the product brochure available in the Resources tab."
            )
          }
          onMouseLeave={() => setHoveredInfo(null)}
        >
          ?
        </div>
      </div>

      {/* ✅ Show Validation Error */}
      {validationErrors["Finial Options"] && <p className="error-text">{validationErrors["Finial Options"]}</p>}
    </div>
)}



{/* ✅ Additional Options Dropdown */}
{(selectedProduct === "Roman Shades" || selectedProduct === "Quick Ship Panels") &&
  optionsData["Additional Options"] &&
  optionsData["Additional Options"].length > 0 && (
    <div className="additional-options-container">
      <label className="form-label">Additional Options:</label>
      <select
        className={`form-select ${validationErrors["Additional Options"] ? "error" : ""}`}
        value={additionalOptions || ""}
        onChange={(e) => {
          setAdditionalOptions(e.target.value);
          handleOptionChange("Additional Options", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Additional Options": e.target.value ? null : "Additional option selection is required.",
          }));
        }}
      >
        <option value="">Select Option</option>
        {optionsData["Additional Options"]
          .filter(option => option !== "6 Valence") // ✅ Exclude "Valence"
          .map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
      </select>

      {/* ✅ Validation Error Message */}
      {validationErrors["Additional Options"] && <p className="error-text">{validationErrors["Additional Options"]}</p>}

      {/* 🎯 Show Decorative Tape Type & Color Dropdowns If "Decorative Tape" is Selected */}
      {additionalOptions === "Decorative Tape" && (
        <div className="decorative-tape-selection">
          <label className="form-label">Select Decorative Tape Type:</label>
          <div className="dropdown-with-info">
            <select
              className={`form-select ${validationErrors["Decorative Tape Type"] ? "error" : ""}`}
              value={decorativeTapeType || ""}
              onChange={(e) => {
                setDecorativeTapeType(e.target.value);
                handleOptionChange("Decorative Tape Type", e.target.value);
                setValidationErrors((prevErrors) => ({
                  ...prevErrors,
                  "Decorative Tape Type": e.target.value ? null : "Tape type selection is required.",
                }));
              }}
            >
              <option value="">Select Tape Type</option>
              <option value="Chain">Chain</option>
              <option value="Diamond">Diamond</option>
              <option value="Scalloped">Scalloped</option>
            </select>

            {/* ✅ Info Button for Decorative Tape Type */}
            <div
              className="info-button"
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  "Standard placement is a 2-inch inset on the sides only. Custom placements outside this standard can be accommodated upon request. For visual references, please consult the product brochure in the Resources tab."
                )
              }
              onMouseLeave={() => setHoveredInfo(null)}
            >
              ?
            </div>
          </div>

          {/* ✅ Validation Error Message */}
          {validationErrors["Decorative Tape Type"] && (
            <p className="error-text">{validationErrors["Decorative Tape Type"]}</p>
          )}

          {/* 🖌 Show Tape Colors If Tape Type is Selected */}
          {decorativeTapeType && (
            <label className="form-label">
              Select Decorative Tape Color:
              <select
                className={`form-select ${validationErrors["Decorative Tape Color"] ? "error" : ""}`}
                value={decorativeTapeColor || ""}
                onChange={(e) => {
                  setDecorativeTapeColor(e.target.value);
                  handleOptionChange("Decorative Tape Color", e.target.value);
                  setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    "Decorative Tape Color": e.target.value ? null : "Tape color selection is required.",
                  }));
                }}
              >
                <option value="">Select Tape Color</option>
                {getAvailableColors(decorativeTapeType).map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>

              {/* ✅ Validation Error Message */}
              {validationErrors["Decorative Tape Color"] && (
                <p className="error-text">{validationErrors["Decorative Tape Color"]}</p>
              )}
            </label>
          )}
        </div>
      )}
    </div>
)}


{/* ✅ Handle Options (Only show if "Manual Crank" is selected) */}
{selectedProduct === "Patio Shades" && selectedOptions["Control Options"] === "Manual Crank" && (
  <div className="handle-options-container">
    <label className="form-label">Handle Options:</label>
    <select
      className={`form-select ${validationErrors["Handle Options"] ? "error" : ""}`}
      value={handleOption || ""}
      onChange={(e) => {
        setHandleOption(e.target.value);
        handleOptionChange("Handle Options", e.target.value);
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          "Handle Options": e.target.value ? null : "Handle option is required.",
        }));
      }}
    >
      <option value="">Select Handle Option</option>
      <option value="4ft Handle">4ft Handle</option>
      <option value="5ft Handle">5ft Handle</option>
      <option value="6ft Handle">6ft Handle</option>
    </select>

    {/* Validation Error Message - Directly Below Dropdown */}
    {validationErrors["Handle Options"] && <p className="error-text">{validationErrors["Handle Options"]}</p>}
  </div>
)}

{/* ✅ NEW: "Hinge Color" Category (Only for Shutters) */}
{selectedProduct === "Composite Shutters" && (
  <div className="hinge-color-selection">
    <label className="form-label">
      Hinge Color:
      <select
        className={`form-select ${validationErrors["Hinge Color"] ? "error" : ""}`}
        value={hingeColor || ""}
        onChange={(e) => {
          setHingeColor(e.target.value);
          handleOptionChange("Hinge Color", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Hinge Color": e.target.value ? null : "Hinge color is required.",
          }));
        }}
      >
        <option value="">Select Hinge Color</option>
        <option value="Antique Brass">Antique Brass</option>
        <option value="Off White">Off White</option>
        <option value="Oil Rubbed Bronze">Oil Rubbed Bronze</option>
        <option value="Satin Nickel">Satin Nickel</option>
        <option value="Stainless Steel">Stainless Steel</option>
        <option value="White">White</option>
      </select>
    </label>

    {/* Validation Error Message */}
    {validationErrors["Hinge Color"] && <p className="error-text">{validationErrors["Hinge Color"]}</p>}
  </div>
)}

{/* Tooltip (Shows on Hover) */}
{tooltip.visible && (
  <div className="tooltip" style={{ top: tooltip.y, left: tooltip.x }}>
    {tooltip.message}
  </div>
)}
</div>

        
{/* Right Column for Price and Errors */}
{/* 📌 Price Column Section */}
<div className="price-column">
  <div className="right-column-content">

{/* ✅ Total Price */}
<div className="total-price">
  <h2>Total Price: ${Math.round(totalPrice)}</h2>

  {/* ✅ Show tariff message for Motorized Roller Shades OR any Natural Shades */}
  {(selectedProduct === "Roller Shades" && selectedOptions["Control Options"] === "Motorized") ||
   selectedProduct === "Natural Shades" ? (
    <p className="tariff-warning">
      *Includes 10% import tariff for {selectedProduct === "Natural Shades" ? "natural shade materials" : "motorized components"}.
    </p>
  ) : null}
</div>



{/* ✅ Filtered Selected Options by Product & Control */}
{Object.entries(selectedOptions).some(([key, value]) =>
  key !== "Motorization Options" &&
  value &&
  value !== "None" &&
  (optionsData[key]?.includes(value) || sizeBasedPricing[value])
) && (

  <div className="selected-options-pricing">
    <h3>Selected Options:</h3>

    {Object.entries(selectedOptions)
  .filter(([key, value]) =>
    key !== "Motorization Options" &&
    value &&
    value !== "None" &&
    (optionsData[key]?.includes(value) || sizeBasedPricing[value])
  )

  .map(([categoryKey, value]) => {
    const roundedWidth = Math.ceil(width / 12) * 12 || 0;
    const roundedHeight = Math.ceil(height / 12) * 12 || 0;
    const dimensionKey = `${roundedWidth}x${roundedHeight}`;
  
    let optionPrice = 0;
  
    // 1️⃣ Try dimension-based pricing first
    if (
      typeof sizeBasedPricingData[value] === "object" &&
      sizeBasedPricingData[value][dimensionKey] !== undefined
    ) {
      optionPrice = sizeBasedPricingData[value][dimensionKey];
    }
  
    // 2️⃣ Fallback to flat pricing
    if (optionPrice === 0 && typeof sizeBasedPricing[value] === "number") {
      optionPrice = sizeBasedPricing[value];
    }
  
    // 3️⃣ Debug output if needed
    console.log("🔍 Option Pricing:", {
      categoryKey,
      value,
      dimensionKey,
      optionPrice,
    });
  
    return (
      <div key={categoryKey} className="option-price-item">
        <span className="option-name">{value}</span>
        {optionPrice > 0 && (
          <span className="option-price">
            ${Math.round(optionPrice * costFactor).toFixed(0)}
          </span>
        )}
      </div>
    );

  
        
      })}

    {/* ✅ Message for Included Options (free/no-cost) */}
    {Object.entries(selectedOptions).some(([key, value]) => {
      const pricingData = sizeBasedPricing[value];
      const dimensionKey = `${Math.ceil(width / 12) * 12}x${Math.ceil(height / 12) * 12}`;
      if (typeof pricingData === "number" && pricingData === 0) return true;
      if (typeof pricingData === "object" && pricingData[dimensionKey] === 0) return true;
      return false;
    }) && (
      <p className="no-extra-charge-message">
        *Options listed without a price are included at no additional charge.
      </p>
    )}
  </div>
)}


 {/* ✅ Quantity Selection (Fixes alignment) */}
 <div className="quantity-container">
      <label className="quantity-label">
        Quantity:
        <input
          type="number"
          value={selectedProduct ? quantity : 1}
          onChange={handleQuantityChange}
          min="1"
          className="quantity-input"
        />
      </label>
    </div>

{/* ✅ Hardware Accessories Section */}
{selectedProduct === "Quick Ship Panels" && selectedOptions["Hardware Options"] && (
  <div className="hardware-accessories">
    <h3>Hardware Accessories</h3>
    <div className="option-price-item">
      <span className="option-name">
        {selectedOptions["Hardware Options"].replace(" With Rings", "")}
      </span>
      {(() => {
        const dimensionKey = `${Math.ceil(width / 12) * 12}x${Math.ceil(height / 12) * 12}`;
        const pricingData = sizeBasedPricing[selectedOptions["Hardware Options"]];
        const hardwarePrice = typeof pricingData === "object"
          ? pricingData[dimensionKey] || 0
          : pricingData || 0;
        return hardwarePrice > 0 && (
          <span className="option-price">${Math.round(hardwarePrice * costFactor)}</span>
        );
      })()}
    </div>

    {selectedOptions["Hardware Color"] && (
      <div className="option-price-item">
        <span className="option-name">Color: {selectedOptions["Hardware Color"]}</span>
      </div>
    )}

    {selectedOptions["Finial Options"] && !selectedOptions["Hardware Options"].includes("French Return") && (
      <div className="option-price-item">
        <span className="option-name">Finial: {selectedOptions["Finial Options"]}</span>
      </div>
    )}

    <p className="accessory-info-message">
      *Accessories are priced separately and do not multiply with the selected quantity.
    </p>
  </div>
)}


{/* ✅ Motorization & Manual Crank Accessories Section */}
<div className="motorization-subtotal">
  {/* ✅ Ensure the heading changes dynamically */}
  {/* ✅ Motorization & Manual Crank Accessories Section */}
{["Manual Crank", "Motorized"].includes(selectedOptions["Control Options"]) && (
  <div className="motorization-subtotal">

    {/* ✅ Manual Crank Accessories */}
    {selectedOptions["Control Options"] === "Manual Crank" && selectedOptions["Handle Options"] && (
      <>
        <h3>Manual Crank Accessories</h3>
        <div className="option-price-item">
          <span className="option-name">{selectedOptions["Handle Options"]}</span>
          <span className="option-price">
            ${Math.round(27 * costFactor)}
          </span>
        </div>
      </>
    )}

    {/* ✅ Motorization Accessories */}
    {selectedOptions["Control Options"] === "Motorized" && (
      <>
        <h3>Motorization Accessories</h3>
        {(Array.isArray(selectedOptions["Motorization Options"]) &&
          selectedOptions["Motorization Options"].length > 0) ? (
          selectedOptions["Motorization Options"].map((option) => {
            const optionPrice = sizeBasedPricingData[option] || 0;

            return (
              <div key={option} className="option-price-item">
                <span className="option-name">{option}</span>
                {optionPrice > 0 && (
                  <span className="option-price">
                    ${Math.round(optionPrice * costFactor)}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <p>No motorization accessories selected.</p>
        )}
      </>
    )}

    {/* ✅ General Accessory Message */}
    <p className="accessory-info-message">
      *Accessories are priced separately and do not multiply with the selected quantity.
    </p>

    {/* ✅ Product-Specific Guidance */}
    <p className="accessory-info-message1">
      {selectedOptions["Control Options"] === "Manual Crank"
        ? "*At least (1) Crank Handle is required per order."
        : selectedOptions["Control Options"] === "Motorized" && selectedProduct === "Patio Shades"
        ? "*At least (1) Remote is required per order when ordering Motorized Patio Shades."
        : selectedOptions["Control Options"] === "Motorized"
        ? "*At least (1) Remote and (1) Charger are required per order."
        : ""}
    </p>

  </div>
)}

  {/* ✅ Add/Update Item to Quote Button */}
  <div className="quote-actions">
    {isEditMode ? (
      <button className="add-to-quote-btn" onClick={handleUpdateItem}>
        Update Item
      </button>
    ) : (
      <button className="add-to-quote-btn" onClick={handleSaveItem}>
        Add Item(s) to Quote
      </button>
    )}

    {(hasAddedItem || localStorage.getItem("hasAddedItem") === "true") && currentQuoteId && (
      <button
        className="add-to-quote-btn"
        onClick={() => {
          console.log("📌 Navigating to quote:", currentQuoteId);
          navigate(`/quote/${currentQuoteId}`);
        }}
      >
        Go to Quote
      </button>
    )}
  </div>

  {showAlert && (
  <CustomAlert
    message={alertMessage}
    onClose={() => setShowAlert(false)}
  />
)}




    </div>


  </div>
</div>



      </div>

      
  ); 
};

export default QuotingPage;
