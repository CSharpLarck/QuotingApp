import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, auth, query, where, doc, setDoc, getDoc, serverTimestamp } from '../firebase'; // Assuming firebase is already set up
import './QuotingPage.css';
import CustomAlert from './CustomAlert';
import './CustomAlert.css'; // Ensure you import the CSS
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom"; // ✅ Import useParams
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
// eslint-disable-next-line no-unused-vars
const location = useLocation();
  const [widthFraction, setWidthFraction] = useState('');
  const [heightFraction, setHeightFraction] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
 // eslint-disable-next-line no-unused-vars
const [isPriceMatched, setIsPriceMatched] = useState(true);

// eslint-disable-next-line no-unused-vars
const [widthErrorMessage, setWidthErrorMessage] = useState('');

// eslint-disable-next-line no-unused-vars
const [heightErrorMessage, setHeightErrorMessage] = useState('');

  const [isQuickShip, setIsQuickShip] = useState(false); // Track if Quick Ship Panel
  const [optionsData, setOptionsData] = useState({}); // Store options categorized by product
  const [sizeBasedPricing, setSizeBasedPricing] = useState(new Map());
  const [sizeBasedPricingData, setSizeBasedPricingData] = useState({});
  const [quantity, setQuantity] = useState(1); // Default quantity is 1
   // eslint-disable-next-line no-unused-vars
  const [calculatedTotal, setCalculatedTotal] = useState(0); // Stores final price
  // eslint-disable-next-line no-unused-vars
  const [showMotorizationOptions, setShowMotorizationOptions] = useState(false);
  const [tooltip, setTooltip] = useState(""); // Ensures it's always a string
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
   // eslint-disable-next-line no-unused-vars
  const [selectedSize, setSelectedSize] = useState(''); 
  const [showAlert, setShowAlert] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentQuoteId, setCurrentQuoteId] = useState(null); // ✅ Store Quote ID
  const [hoveredInfo, setHoveredInfo] = useState(null);   
  const [categories, setCategories] = useState([]); // ✅ State for storing categories

  const { quoteId } = useParams(); // ✅ Get quoteId from URL
  const [customerName, setCustomerName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [sidemark, setSidemark] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [costFactor, setCostFactor] = useState(1); // Default multiplier = 1

  


  


  const [minMaxDimensions, setMinMaxDimensions] = useState({
    minWidth: Infinity,
    maxWidth: -Infinity,
    minHeight: Infinity,
    maxHeight: -Infinity,
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
  
  

const roundedWidth = Math.ceil(width / 12) * 12;
const roundedHeight = Math.ceil(height / 12) * 12;
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

  // ✅ Use existing quoteId or retrieve from localStorage
  let quoteToUpdateId = quoteId || localStorage.getItem("currentQuoteId");
  
  if (!quoteToUpdateId) {
    quoteToUpdateId = uuidv4(); // ✅ Generate only if no existing quoteId
    localStorage.setItem("currentQuoteId", quoteToUpdateId);
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
    motorizationOptions: (() => {
      const motorization = Array.isArray(selectedOptions["Motorization Options"]) 
        ? selectedOptions["Motorization Options"]
        : [];
    
      console.log("⚡ Motorization Options Being Saved:", motorization); // ✅ Debugging log
    
      return motorization;
    })(),
     
    handleOptions: selectedOptions["Handle Options"] || "N/A",
    headboxOptions: selectedOptions["Headbox Options"] || "N/A",
    fasciaColor: selectedOptions["Fascia Color"] || "N/A",
    hardwareOptions: selectedProduct === "Quick Ship Panels" 
      ? (selectedOptions["Hardware Options"] || "N/A") 
      : "N/A",
    additionalOptions: selectedOptions["Additional Options"] || "N/A",
    decorativeTapeType: selectedOptions["Decorative Tape Type"] || "N/A",
    decorativeTapeColor: selectedOptions["Decorative Tape Color"] || "N/A",
    totalPrice: Math.round(totalPrice)
  };

  console.log("📌 Updated Item Data:", updatedItem);

  try {
    const quoteRef = doc(db, "quotes", quoteToUpdateId);
    const quoteSnap = await getDoc(quoteRef);
    console.log("📦 Firestore Data After Saving:", quoteSnap.data());
    
    
    let quoteData = { items: [] }; // Default if no quote exists
    if (quoteSnap.exists()) {
      quoteData = quoteSnap.data(); // Retrieve existing quote data
    }

    console.log("📌 Existing Quote Data:", quoteData);

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
      createdBy: user.uid, // ✅ Store User ID of the creator
    });

    console.log("✅ Quote successfully updated!");

    setCurrentQuoteId(quoteToUpdateId);
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

  // ✅ Validate Customer Information (Always Required)
  if (!customerName.trim()) errors.customerName = "Customer name is required.";
  if (!poNumber.trim()) errors.poNumber = "P.O. number is required.";
  if (!sidemark.trim()) errors.sidemark = "Sidemark is required.";
  if (!selectedOptions["Window Location"]?.trim()) {
    errors["Window Location"] = "Window location is required.";
  }

  // ✅ Validate Width & Height for Quick Ship Panels (Dropdowns)
  if (isQuickShip) {
    if (!width || width === "") errors.width = "Width selection is required.";
    if (!height || height === "") errors.height = "Height selection is required.";
  } else {
    // ✅ Standard Min/Max Validation for Other Products
    if (!width || width < minMaxDimensions.minWidth || width > minMaxDimensions.maxWidth) {
      errors.width = `Width must be between ${minMaxDimensions.minWidth} and ${minMaxDimensions.maxWidth} inches.`;
    }
    if (!height || height < minMaxDimensions.minHeight || height > minMaxDimensions.maxHeight) {
      errors.height = `Height must be between ${minMaxDimensions.minHeight} and ${minMaxDimensions.maxHeight} inches.`;
    }
  }



  // ✅ Validate Basic Product Information
  if (!selectedCategory) errors.selectedCategory = "Category is required.";
  if (!selectedProduct) errors.selectedProduct = "Product is required.";
  if (!width) errors.width = "Width is required.";
  if (!height) errors.height = "Height is required.";

    // ✅ Quick Ship Panels: Validate Dropdown Selections
    if (selectedProduct === "Quick Ship Panels") {
      if (!width) errors.width = "Please select a Width.";
      if (!height) errors.height = "Please select a Height.";
    }

  // ✅ Validate Fabric Selection Only If Needed
  if (fabricCollectionOptions.length > 0 && !selectedFabricOption) {
    errors.selectedFabricOption = "Fabric selection is required.";
  }
  if (fabricColorOptions.length > 0 && !selectedFabricColorOption) {
    errors.selectedFabricColorOption = "Fabric color is required.";
  }

  // ✅ Validate Mounting Position Only If Required
  const productsRequiringMountingPosition = [
    "Roller Shades",
    "2.5 Faux Wood Blinds",
    "2 Faux Wood Blinds",
    "Roman Shades",
    "Natural Shades",
    "Patio Shades"
  ];

  if (productsRequiringMountingPosition.includes(selectedProduct) && !selectedOptions["Mounting Position"]) {
    errors["Mounting Position"] = "Mounting position is required.";
  }

   // ✅ Conditionally require Control Position only if Loop Control or Continuous Loop is selected
   const requiresControlPosition = ["Loop Control", "Continuous Loop"];
   if (requiresControlPosition.includes(selectedOptions["Control Options"]) && !selectedOptions["Control Position"]) {
     errors["Control Position"] = "Control position is required.";
   
  }

   // ✅ Conditional Validation for Liner Color
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
    "Patio Shades": ["Control Options"], // ❌ Removed "Control Position"
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
    console.warn("⚠️ Finial Option is required but missing!");
    errors["Finial Options"] = "Finial option is required.";
  }
} else {
  // ✅ Remove Finial Options error if Hardware Options is NOT Decorative Pole or Traverse Rod
  delete errors["Finial Options"];
}




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
  
    // ✅ (Optional) Validate Decorative Tape Color (Only if Type is selected)
    if (selectedOptions["Decorative Tape Type"] && !selectedOptions["Decorative Tape Color"]) {
      errors["Decorative Tape Color"] = "Please select a Decorative Tape Color.";
    }

  // ✅ LOG ERRORS BEFORE RETURNING
  if (Object.keys(errors).length > 0) {
    console.warn("⚠️ Validation Errors:", errors);
  }

    // ✅ Set validation state
    setValidationErrors(errors);

    // ✅ Return errors object to be used in `handleSaveItem`
    return errors;
  };



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
      let updatedOptions = { ...prevOptions };
  
      if (category === "Control Options") {
        setShowMotorizationOptions(newOption === "Motorized");
    
        // ✅ Reset Motorization Options if switching away from "Motorized"
        if (newOption !== "Motorized") {
            delete updatedOptions["Motorization Options"];
        }
    
        // ✅ Fetch motorization options **only once** after state updates
        if (newOption === "Motorized") {
            setTimeout(fetchMotorizationOptions, 0);
        }

        if (category === "Motorization Options") {
          updatedOptions[category] = updatedOptions[category] || [];
        
          if (updatedOptions[category].includes(newOption)) {
            updatedOptions[category] = updatedOptions[category].filter(opt => opt !== newOption);
          } else {
            updatedOptions[category] = [...updatedOptions[category], newOption];
          }
        
          // ✅ Update size-based pricing when a motorization option is selected
          if (sizeBasedPricingData[newOption]) {
            console.log(`💰 Updating Size-Based Pricing for ${newOption}:`, sizeBasedPricingData[newOption]);
            setSizeBasedPricing((prev) => ({
              ...prev,
              [newOption]: sizeBasedPricingData[newOption] || {},
            }));
          } else {
            console.warn(`🚨 No size-based pricing found for Motorization Option: ${newOption}`);
          }
        }
        

         // ✅ Ensure Headbox Options triggers Fascia Color dropdown
    if (category === "Headbox Options") {
      if (newOption === "Metal Fascia") {
        updatedOptions["Fascia Color"] = ""; // ✅ Reset Fascia Color if switching
      } else {
        delete updatedOptions["Fascia Color"]; // ✅ Remove Fascia Color if another Headbox is selected
      }
    }

      // ✅ Reset Manual Crank Handle Options for Patio Shades
      if (selectedProduct === "Patio Shades") {
        delete updatedOptions["Handle Options"];
      }

        // ✅ Reset Control Position if switching away from Loop Control or Continuous Loop
        if (!["Loop Control", "Continuous Loop"].includes(newOption)) {
          delete updatedOptions["Control Position"];
        }
  
        // ✅ Reset quantity when Control Options change
        setQuantity(1);
      }

      
  
      /** ✅ HANDLE MOTORIZATION OPTIONS (Check/Uncheck Toggle) **/
      if (category === "Motorization Options") {
        updatedOptions[category] = updatedOptions[category] || []; // Ensure it's an array
      
        if (updatedOptions[category].includes(newOption)) {
          // ✅ Uncheck (Remove from array)
          updatedOptions[category] = updatedOptions[category].filter(opt => opt !== newOption);
        } else {
          // ✅ Check (Add to array)
          updatedOptions[category] = [...updatedOptions[category], newOption];
        }
      
        console.log("🚀 Updated Motorization Options:", updatedOptions[category]); // Debugging log
      }
      
  
      if (category === "Hardware Options") {
        updatedOptions["Hardware Options"] = newOption;
      
        // 🔍 Debugging Logs - Check Selected Hardware Option
        console.log("🛠 Selected Hardware Option:", newOption);
        console.log("🛠 Should Finial Options Render?:", 
          newOption && !["French Return", "French Return With Rings"].includes(newOption)
        );
      
        // ✅ Only show "Finial Options" when NOT selecting "French Return"
        if (["Decorative Pole", "Traverse Rod"].includes(newOption)) {
          if (!updatedOptions["Finial Options"]) {
            updatedOptions["Finial Options"] = ""; // ✅ Ensure Finial exists
          }
        } else {
          delete updatedOptions["Finial Options"]; // ❌ Reset Finial if switching to "French Return"
        }
      
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
        
          if (newOption) delete newErrors["Hardware Options"];
        
          // ✅ If switching to a non-Finial-required hardware option, clear Finial validation error
          if (!["Decorative Pole", "Traverse Rod"].includes(newOption)) {
            delete newErrors["Finial Options"];
          }
        
          return newErrors;
        });
        
      }
      

      /** ✅ HANDLE OTHER DROPDOWN OPTIONS **/
      else if (category === "Additional Options") {
        updatedOptions["Additional Options"] = newOption;
  
        // ✅ Reset Decorative Tape Type & Color when "Decorative Tape" is NOT selected
        if (newOption !== "Decorative Tape") {
          delete updatedOptions["Decorative Tape Type"];
          delete updatedOptions["Decorative Tape Color"];
        }
      }
  
      /** ✅ HANDLE DECORATIVE TAPE SELECTION (Reset when changing) **/
      else if (category === "Decorative Tape Type") {
        updatedOptions["Decorative Tape Type"] = newOption;
  
        // ✅ Reset Decorative Tape Color if Tape Type changes
        if (!newOption) {
          delete updatedOptions["Decorative Tape Color"];
        }
      }
  
      /** ✅ HANDLE MANUAL CRANK HANDLE OPTIONS (Ensure Only 1 Selection) **/
      else if (category === "Handle Options") {
        updatedOptions["Handle Options"] = newOption; // Override previous selection
      }
  
      /** ✅ DEFAULT: HANDLE REGULAR DROPDOWN SELECTIONS **/
      else {
        updatedOptions[category] = newOption;
      }
  
      return updatedOptions;
    });
  
    /** ✅ FETCH MOTORIZATION OPTIONS WHEN "MOTORIZED" IS SELECTED **/
    if (category === "Control Options" && newOption === "Motorized") {
      console.log("🔍 Fetching Motorization Options for selected product...");
  
      try {
        // ✅ Get the selected product data from `productsData`
        const selectedProductData = productsData.find(product => product.name === selectedProduct);
  
        if (!selectedProductData || !selectedProductData.optionRefs) {
          console.warn("⚠️ No optionRefs found for this product.");
          return;
        }
  
        // ✅ Fetch motorization options from Firestore
        const optionDocs = await Promise.all(
          selectedProductData.optionRefs.map((optionRef) => getDoc(optionRef))
        );
  
        const motorizationOptions = optionDocs
          .filter((doc) => doc.exists() && doc.data().optionCategory === "Motorization Options")
          .map((doc) => doc.data().optionName);
  
        console.log("✅ Motorization Options Found:", motorizationOptions);
  
        // ✅ Update the optionsData state
        setOptionsData((prev) => ({
          ...prev,
          "Motorization Options": motorizationOptions,
        }));
      } catch (error) {
        console.error("❌ Error fetching motorization options:", error);
      }
    }
  
    /** ✅ Ensure size-based pricing data updates correctly **/
    if (sizeBasedPricingData[newOption]) {
      console.log(`Updating size-based pricing for ${newOption}:`, sizeBasedPricingData[newOption]);
      setSizeBasedPricing((prev) => ({
        ...prev,
        [newOption]: sizeBasedPricingData[newOption] || {},
      }));
    } else {
      console.warn(`No size-based pricing found for ${newOption}`);
    }
  };
  
  
  
  // Function to update the selected option for a category
// eslint-disable-next-line no-unused-vars
const [selectedOption, setSelectedOption] = useState(null);
    useEffect(() => {
      // Ensure all necessary values are available
      if (selectedOption && selectedSize && sizeBasedPricingData) {
        const price = fetchSizeBasedPricing(selectedOption, selectedSize, sizeBasedPricingData);
        console.log('Fetched price:', price);
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

      // Fetch Products based on category
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('category', '==', selectedCategory));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No products found for the selected category');
        setProducts([]); // Set an empty array if no products are found
        return;
      }

      const fetchedProducts = querySnapshot.docs.map((doc) => doc.data());
      console.log('Fetched products:', fetchedProducts);

      // Ensure unique products by their name
      const uniqueProducts = [
        ...new Map(fetchedProducts.map((product) => [product.name, product])).values(),
      ];
      console.log('Unique products by name:', uniqueProducts);

      setProducts(uniqueProducts);

      // Fetch product data (e.g., fabric options, pricing rules, etc.)
      const allProductsData = [];
      for (let docSnap of querySnapshot.docs) {
        const productData = docSnap.data();
        const productId = docSnap.id;

        const pricingRules = productData.pricingRules || {};
        const productDetails = {
          productId: productId,
          name: productData.name,
          fabricCollectionOptions: productData.fabricCollectionOptions || [],
          fabricColorOptions: Array.isArray(productData.fabricColorOptions) ? productData.fabricColorOptions : [],
          pricingRules: pricingRules,
          optionRefs: productData.options || [], // Storing the references to the options collection
        };

        console.log(`Product "${productData.name}" optionRefs:`, productData.options); // Logging optionRefs

        allProductsData.push(productDetails);
      }

      setProductsData(allProductsData);

      // Fetch options based on the selected fabricCollectionOption
      if (selectedFabricOption) {
        console.log('Fetching options for selected fabric collection option:', selectedFabricOption);

        // Find the relevant product data based on the fabric collection option
        const selectedProductData = allProductsData.find((prod) =>
          prod.fabricCollectionOptions.includes(selectedFabricOption)
        );

        if (selectedProductData) {
          console.log('Fetching options for selected product:', selectedProductData);
          // Fetch options based on the optionRefs of the selected product
          await fetchOptions(selectedProductData.optionRefs); // Pass the references to fetch the options
        } else {
          console.log('No relevant product found for the selected fabric option');
        }
      }

    } catch (error) {
      console.error('Error fetching products data:', error);
    }
  };

  fetchData();
}, [selectedCategory, selectedFabricOption]);

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
    if (width && (width < minMaxDimensions.minWidth || width > minMaxDimensions.maxWidth)) {
      setValidationErrors((prev) => ({
        ...prev,
        width: `Width must be between ${minMaxDimensions.minWidth} and ${minMaxDimensions.maxWidth} inches.`,
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, width: "" })); // ✅ Use empty string
    }
  }, [width, minMaxDimensions]);
  
  useEffect(() => {
    if (height && (height < minMaxDimensions.minHeight || height > minMaxDimensions.maxHeight)) {
      setValidationErrors((prev) => ({
        ...prev,
        height: `Height must be between ${minMaxDimensions.minHeight} and ${minMaxDimensions.maxHeight} inches.`,
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, height: "" })); // ✅ Use empty string
    }
  }, [height, minMaxDimensions]);
  

  useEffect(() => {
    // ✅ Reset validation
    setTotalPrice(null);
    setIsPriceMatched(false);
    setWidthErrorMessage('');
    setHeightErrorMessage('');

    if (!selectedProduct || !pricingRules || pricingRules.size === 0) {
        console.warn("🚨 Waiting for selectedProduct and pricingRules...");
        return;
    }

    // ✅ Handle Empty Inputs Before Parsing
    if (!width.trim() || !height.trim()) {
        setWidthErrorMessage("Width is required.");
        setHeightErrorMessage("Height is required.");
        console.warn("🚨 Width or Height is empty!");
        return;
    }

    // ✅ Convert width & height to inches safely
    const widthInches = isNaN(parseFloat(width)) ? 0 : parseFloat(width) + calculateInches(0, widthFraction);
    const heightInches = isNaN(parseFloat(height)) ? 0 : parseFloat(height) + calculateInches(0, heightFraction);

    if (isNaN(widthInches) || isNaN(heightInches)) {
        console.error("🚨 Invalid width or height input!", { width, height, widthFraction, heightFraction });
        return;
    }

    // ✅ Ensure min/max dimensions are valid
    if (!isFinite(minMaxDimensions.maxWidth) || !isFinite(minMaxDimensions.maxHeight)) {
        console.warn("🚨 minMaxDimensions is invalid!", minMaxDimensions);
        return;
    }

    // ✅ Set min/max width & height based on product
    const minWidth = isQuickShip ? 0 : (selectedProduct === "Patio Shades" ? 36 : 24);
    const minHeight = selectedProduct === "Patio Shades" ? 36 : 24;

    let widthError = "";
    let heightError = "";

    // ✅ Validate width constraints
    if (!isQuickShip && widthInches < minWidth) {
        widthError = `Minimum width must be ${minWidth} inches.`;
    } else if (widthInches > minMaxDimensions.maxWidth) {
        widthError = `Maximum width is ${minMaxDimensions.maxWidth} inches.`;
    }

    // ✅ Validate height constraints
    if (heightInches < minHeight) {
        heightError = `Minimum height must be ${minHeight} inches.`;
    } else if (heightInches > minMaxDimensions.maxHeight) {
        heightError = `Maximum height is ${minMaxDimensions.maxHeight} inches.`;
    }

    if (widthError || heightError) {
        setWidthErrorMessage(widthError);
        setHeightErrorMessage(heightError);
        console.warn("🚨 Validation Errors:", { widthError, heightError });
        return;
    }

    // ✅ Round dimensions
    const roundedWidth = Math.ceil(widthInches / 12) * 12;
    const roundedHeight = Math.ceil(heightInches / 12) * 12;
    const dimensionKey = `${roundedWidth}x${roundedHeight}`;

    console.log("🔍 Looking up price for dimension:", dimensionKey);

    // ✅ Define hardcoded prices for Handle Options (since it's not in Firestore)
const handlePricing = {
  "4ft Handle": 27,
  "5ft Handle": 27,
  "6ft Handle": 27,
};

// ✅ Get base price based on dimensions
const basePrice = pricingRules.get(dimensionKey);
if (basePrice === undefined) {
    console.warn(`🚨 No pricing found for dimension: ${dimensionKey}`);
    return;
}

let basePriceTotal = 0;
let accessoryTotal = 0;

// ✅ Define categories that should be part of base price (multiplied by quantity)
const basePriceCategories = [
    "Control Options",
    "Liner Options",
    "Shade Styles",
    "Tilt Options",
    "Headbox Options",
];

// ✅ Define categories that should be added separately (NOT multiplied by quantity)
const accessoryCategories = [
    "Hardware Options",
    "Hardware Color",
    "Finial Options",
    "Motorization Options",
    "Handle Options",
];

console.log("🔍 Selected Options:", selectedOptions);
console.log("💰 Full Size-Based Pricing Data:", sizeBasedPricingData);
console.log("🔧 Checking Accessories Pricing:");

accessoryCategories.forEach((accessory) => {
    const accessoryOption = selectedOptions[accessory];
    console.log(`➡️ Checking ${accessory}:`, accessoryOption);

    if (Array.isArray(accessoryOption)) {
        accessoryOption.forEach((option) => {
            console.log(`   🔹 ${option}:`, sizeBasedPricingData[option] || "❌ No price found");
        });
    } else {
        console.log(`   🔹 ${accessoryOption}:`, sizeBasedPricingData[accessoryOption] || "❌ No price found");
    }
});


// ✅ Log Selected Options and Pricing Data
console.log("🔍 Selected Options:", selectedOptions);
console.log("💰 Full Size-Based Pricing Data:", sizeBasedPricingData);

// ✅ Loop through selected options and calculate prices accordingly
Object.keys(selectedOptions).forEach((categoryKey) => {
    const selectedOption = selectedOptions[categoryKey];

    if (!selectedOption) return;

    let optionPrice = 0;

    if (categoryKey === "Motorization Options" && Array.isArray(selectedOption)) {
      selectedOption.forEach((motorizationItem) => {
          console.log(`🔍 Checking motorization pricing for: ${motorizationItem}`);
          
          // ✅ Ensure we correctly fetch the pricing value
          let motorizationPrice = 0;
          if (typeof sizeBasedPricingData[motorizationItem] === "number") {
              motorizationPrice = sizeBasedPricingData[motorizationItem]; // Directly assign price if numeric
          } else if (typeof sizeBasedPricingData[motorizationItem] === "object") {
              motorizationPrice = sizeBasedPricingData[motorizationItem][dimensionKey] ?? 0;
          }
  
          console.log(`💰 Motorization Price for ${motorizationItem}: $${motorizationPrice}`);
          accessoryTotal += motorizationPrice; // ✅ Add to accessory total
      });

    } else if (categoryKey === "Handle Options") {
      // ✅ Apply hardcoded handle pricing (since it's not in Firestore)
      optionPrice = handlePricing[selectedOption] || 0;
      console.log(`💰 Handle Price for ${selectedOption}: $${optionPrice}`);
      accessoryTotal += optionPrice; // ✅ Add to accessories
  
      }  else {
        // ✅ Regular pricing logic for all other options
        const pricingData = sizeBasedPricing[selectedOption];

        if (pricingData) {
            optionPrice = typeof pricingData === "number" ? pricingData : pricingData?.[dimensionKey] || 0;
        }

        if (basePriceCategories.includes(categoryKey)) {
            basePriceTotal += optionPrice; // ✅ Multiply these by quantity
        } else if (accessoryCategories.includes(categoryKey)) {
            console.log(`💰 Adding accessory: ${categoryKey} -> $${optionPrice}`);
            accessoryTotal += optionPrice; // ✅ Add accessories separately (NO multiplication)
        }
    }
});



  // ✅ Multiply base price by quantity and apply cost factor
  const subtotal = (basePrice + basePriceTotal) * quantity * costFactor;

  // ✅ Final total includes accessories but does not multiply them
  const finalTotal = subtotal + accessoryTotal * costFactor;

  console.log(`💰 Final Price (Cost Factor Applied): $${Math.round(finalTotal)}`);
  
  setTotalPrice(finalTotal);
  setIsPriceMatched(true);

}, [width, height, pricingRules, selectedProduct, selectedOptions, widthFraction, heightFraction, minMaxDimensions, sizeBasedPricing, quantity, costFactor]);

  
useEffect(() => {
  setFabricColorOptions([]);
  setPricingRules(new Map());

  if (!selectedFabricOption) return;

  const selectedProductData = productsData.find((product) =>
    product.fabricCollectionOptions.includes(selectedFabricOption)
  );

  if (selectedProductData) {
    const fabricColorOptionsData = selectedProductData.fabricColorOptions || [];
    setFabricColorOptions(fabricColorOptionsData);
    console.log(
      fabricColorOptionsData.length > 0 
        ? 'Fabric Color Options:' 
        : 'No fabric color options available for this product', 
      fabricColorOptionsData
    );

    fetchPricingRules(selectedProductData);
  } else {
    console.error('Selected fabric collection option not found for any product');
  }
}, [selectedFabricOption, productsData, isQuickShip, sizeBasedPricingData]); // ✅ Added missing dependencies


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
    setCalculatedTotal((totalPrice || 0) * quantity * costFactor);
  }, [totalPrice, quantity, costFactor]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

  return (
<div className="product-config-container">
  
{/* Customer Information Section */}
<div className="customer-info-container">
        <h2>Customer Information</h2>
        <div className="customer-info-form">

          {/* Customer Name */}
          <label className="customer-info-label">
            Customer Name:
            <input
              type="text"
              className={`customer-info-input ${validationErrors.customerName ? "error-border" : ""}`}
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

          {/* P.O. Number */}
          <label className="customer-info-label">
            P.O. Number:
            <input
              type="text"
              className={`customer-info-input ${validationErrors.poNumber ? "error-border" : ""}`}
              value={poNumber}
              onChange={(e) => {
                setPoNumber(e.target.value);
                setValidationErrors((prev) => ({
                  ...prev,
                  poNumber: e.target.value.trim() ? "" : "P.O. number is required.",
                }));
              }}
              placeholder="Enter P.O. number"
            />
          </label>
          {validationErrors.poNumber && <p className="error-text">{validationErrors.poNumber}</p>}

          {/* Sidemark */}
          <label className="customer-info-label">
            Sidemark:
            <input
              type="text"
              className={`customer-info-input ${validationErrors.sidemark ? "error-border" : ""}`}
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
          <label className="customer-info-label">
            Address:
            <input
              type="text"
              className="customer-info-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </label>

          {/* Phone Number */}
          <label className="customer-info-label">
            Phone Number:
            <input
              type="text"
              className="customer-info-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
            />
          </label>
        </div>
      </div>


  <div className="form-columns">
    
    {/* Left Column for Product Configuration */}
    <div className="product-column">
      <h1 className="title">Product Configuration</h1>
      {/* Your existing form fields */}
  


      <label className="form-label">
  Select Category:
  <select
    className={`form-select ${validationErrors.selectedCategory ? "error" : ""}`}
    value={selectedCategory} // ✅ Ensure it's controlled
    onChange={handleCategoryChange}
  >
    <option value="">-- Select Category --</option>
    {categories.length > 0 ? (
      categories.map((category, index) => (
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
    className={`form-select ${validationErrors.selectedProduct ? "error" : ""}`}
    value={selectedProduct}
    onChange={handleProductChange}
    disabled={products.length === 0} // 🚨 Disable dropdown if no products
  >
    <option value="">--Select Product--</option>
    {products.length > 0 ? (
      products.map((product) => (
        <option key={product.id} value={product.name}>
          {formatProductName(product.name)}
        </option>
      ))
    ) : (
      <option disabled>No products available</option>
    )}
  </select>

  {/* Show error message if selection is invalid */}
  {validationErrors.selectedProduct && <p className="error-text">{validationErrors.selectedProduct}</p>}
</label>




  
{/* Select Fabric OR Color (Dynamic) */}
{fabricCollectionOptions.length > 0 && (
  <div className="dropdown-container">
    <label className="form-label">
      {["Blinds", "Shutters"].includes(selectedCategory) ? "Select Color:" : "Select Fabric:"}
    </label>
    <div className="dropdown-with-info">
      <select
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
          {["Blinds", "Shutters"].includes(selectedCategory) ? "--Select Color--" : "--Select Fabric--"}
        </option>
        {fabricCollectionOptions.map((option, index) => (
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
        value={selectedFabricColorOption}
        onChange={(e) => {
          setSelectedFabricColorOption(e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            selectedFabricColorOption: e.target.value ? null : "Fabric color is required.",
          }));
        }}
      >
        <option value="">--Select Color--</option>
        {fabricColorOptions.map((color, index) => (
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
        value={width}
        onChange={(e) => {
          setWidth(e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            width: e.target.value ? "" : "Width is required.", // ✅ Trigger validation if no width is selected
          }));
        }}
      >
        <option value="">--Select a Width--</option>
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
          value={width}
          onChange={(e) => {
            setWidth(e.target.value);
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              width: e.target.value ? "" : "Width is required.",
            }));
          }}
          placeholder="Width (inches)"
        />
        <select value={widthFraction} onChange={(e) => setWidthFraction(e.target.value)} className="dimension-fraction">
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
        value={height}
        onChange={(e) => {
          setHeight(e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            height: e.target.value ? "" : "Height selection is required.",
          }));
        }}
      >
        <option value="">--Select a Height--</option>
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
          value={height}
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
        <select value={heightFraction} onChange={(e) => setHeightFraction(e.target.value)} className="dimension-fraction">
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
        value={selectedOptions["Pleat Styles"] || ""}
        onChange={(e) => {
          handleOptionChange("Pleat Styles", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Pleat Styles": e.target.value ? null : "Pleat style selection is required.",
          }));
        }}
      >
        <option value="">--Select Pleat Style--</option>
        <option value="2-Finger Pinch Pleat">2-Finger Pinch Pleat</option>
        <option value="3-Finger Pinch Pleat">3-Finger Pinch Pleat</option>
        <option value="2-Finger Inverted Pinch Pleat">2-Finger Inverted Pinch Pleat</option>
        <option value="3-Finger Inverted Pinch Pleat">3-Finger Inverted Pinch Pleat</option>
        <option value="Rod Pocket">Rod Pocket</option>
        <option value="Back Tab">Back Tab</option>
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




{/* ✅ Mounting Position Dropdown (Hide when "Shutters" is selected) */}
{selectedProduct !== "Quick Ship Panels" && selectedProduct !== "Composite Shutters" && (
  <div className="mounting-position-container">
    <label className="form-label">Mounting Position:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Mounting Position"] ? "error" : ""}`}
        value={selectedOptions["Mounting Position"] || ""}
        onChange={(e) => {
          handleOptionChange("Mounting Position", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Mounting Position": e.target.value ? null : "Mounting position is required.",
          }));
        }}
      >
        <option value="">--Select Mounting Position--</option>
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
    value={selectedOptions["Window Location"] || ""}
    onChange={(e) => {
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



{/* 🎯 Render all options normally, EXCEPT "Control Options", "Additional Options", "Hardware Options", "Shade Styles", and "Tilt Options" */}
{Object.keys(optionsData).length > 0 && (
  <div className="form-container">
    {Object.entries(optionsData)
      .filter(([categoryKey]) => 
        categoryKey !== "Control Options" && 
        categoryKey !== "Additional Options" && 
        categoryKey !== "Hardware Options" &&
        categoryKey !== "Liner Options" &&  // ✅ Exclude liner options
        categoryKey !== "Shade Styles" && // ✅ Exclude shade styles from the normal loop
        categoryKey !== "Headbox Options" &&
        categoryKey !== "Tilt Options"  // ✅ Exclude tilt options so it's rendered separately
      )
      .map(([categoryKey, options]) => {
        
        // ❌ Exclude "Motorization Options" (Handled Separately)
        if (categoryKey === "Motorization Options") return null;

        // ❌ Exclude "Handle Options" for Patio Shades
        if (selectedProduct === "Patio Shades" && categoryKey === "Handle Options") return null;

        // ❌ Hide "1/2" Banding Option for Natural Shades
        if (selectedProduct === "Natural Shades" && categoryKey === "Banding Options") return null;

        // ✅ Render All Other Options Normally
        return (
          <div key={categoryKey} className="dropdown-container">
            <label className="form-label">
              {categoryKey}:
              <select
                className="form-select"
                value={selectedOptions[categoryKey] || ""}
                onChange={(e) => handleOptionChange(categoryKey, e.target.value)}
              >
                <option value="">--Select Option--</option>
                {options.map((option, idx) => (
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
        value={selectedOptions["Tilt Options"] || ""}
        onChange={(e) => {
          handleOptionChange("Tilt Options", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Tilt Options": e.target.value ? null : "Tilt option is required.",
          }));
        }}
      >
        <option value="">--Select Tilt Option--</option>
        {optionsData["Tilt Options"].map((option, idx) => (
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
      {validationErrors["Tilt Options"] && <p className="error-text">{validationErrors["Tilt Options"]}</p>}
  </div>
)}

{/* ✅ Render Headbox Options Separately (Only for Roller Shades) */}
{selectedProduct === "Roller Shades" && optionsData["Headbox Options"] && (
  <div className="dropdown-container">
    <label className="form-label">Headbox Options:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Headbox Options"] ? "error" : ""}`}
        value={selectedOptions["Headbox Options"] || ""}
        onChange={(e) => {
          handleOptionChange("Headbox Options", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Headbox Options": e.target.value ? null : "Headbox option is required.",
          }));
        }}
      >
        <option value="">--Select Headbox Option--</option>
        {optionsData["Headbox Options"].map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* ✅ Info Button with Hover Tooltip (Fixed) */}
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

    {/* ✅ Validation Error Message */}
    {validationErrors["Headbox Options"] && <p className="error-text">{validationErrors["Headbox Options"]}</p>}
  </div>
)}

{/* ✅ Conditional Fascia Color Dropdown (Only If Metal Fascia is Selected) */}
{selectedOptions["Headbox Options"] === "Metal Fascia" && (
  <div className="dropdown-container">
    <label className="form-label">Fascia Color:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Fascia Color"] ? "error" : ""}`}
        value={selectedOptions["Fascia Color"] || ""}
        onChange={(e) => {
          handleOptionChange("Fascia Color", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Fascia Color": e.target.value ? null : "Fascia color is required when selecting Metal Fascia.",
          }));
        }}
      >
        <option value="">--Select Fascia Color--</option>
        <option value="Black">Black</option>
        <option value="White">White</option>
        <option value="Grey">Grey</option>
        <option value="Tan">Tan</option>
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




{/* ✅ Liner Options - Render Separately Only for Products That Have It */}
{optionsData["Liner Options"] && selectedProduct && (
  <div className="liner-container">
    <label className="liner-label">Liner Options:</label>
    <div className="dropdown-with-info">
      <select
        className={`form-select ${validationErrors["Liner Options"] ? "error" : ""}`}
        value={selectedOptions["Liner Options"] || ""}
        onChange={(e) => {
          handleOptionChange("Liner Options", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Liner Options": e.target.value ? null : "Liner option is required.",
          }));
        }}
      >
        <option value="">--Select Liner--</option>
        {optionsData["Liner Options"].map((option, idx) => (
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
            "Liners affect privacy and light control. For visual examples and more details, please refer to the product brochure available in the Resources tab."
          )
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>

    {/* ✅ Validation Error Message */}
    {validationErrors["Liner Options"] && <p className="error-text">{validationErrors["Liner Options"]}</p>}
  </div>
)}


{/* ✅ Conditionally Render Liner Color Dropdown for Roman Shades & Quick Ship Panels */}
{["Roman Shades", "Quick Ship Panels"].includes(selectedProduct) &&
  ["Dimout Liner", "Standard Liner", "Blackout Liner"].includes(selectedOptions["Liner Options"]) && (
    <div className="dropdown-container">
      <label className="form-label">Liner Color:</label>
      <div className="dropdown-with-info">
        <select
          className={`form-select ${validationErrors["Liner Color"] ? "error" : ""}`}
          value={selectedOptions["Liner Color"] || ""}
          onChange={(e) => {
            handleOptionChange("Liner Color", e.target.value);
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              "Liner Color": e.target.value ? null : "Liner color selection is required.",
            }));
          }}
        >
          <option value="">--Select Liner Color--</option>
          <option value="White">White</option>
          <option value="Off White">Off White</option>
        </select>

        {/* ✅ Info Button with Hover Tooltip */}
        <div
          className="info-button"
          onMouseEnter={(e) =>
            handleMouseEnter(
              e,
              "Choose a liner color to complement your shade selection."
            )
          }
          onMouseLeave={() => setHoveredInfo(null)}
        >
          ?
        </div>
      </div>

      {/* ✅ Validation Error Message */}
      {validationErrors["Liner Color"] && <p className="error-text">{validationErrors["Liner Color"]}</p>}
    </div>
)}


{/* ✅ Conditionally Render Liner Color Dropdown for Natural Shades */}
{selectedProduct === "Natural Shades" &&
  ["Privacy Liner", "Blackout Liner"].includes(selectedOptions["Liner Options"]) && (
    <div className="dropdown-container">
      <label className="form-label">Liner Color:</label>
      <div className="dropdown-with-info">
        <select
          className={`form-select ${validationErrors["Liner Color"] ? "error" : ""}`}
          value={selectedOptions["Liner Color"] || ""}
          onChange={(e) => {
            handleOptionChange("Liner Color", e.target.value);
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              "Liner Color": e.target.value ? null : "Liner color selection is required.",
            }));
          }}
        >
          <option value="">--Select Liner Color--</option>
          <option value="White">White</option>
          <option value="Cream">Cream</option>
          <option value="Teak">Teak</option>
          <option value="Natural">Natural</option>
          <option value="Gray">Gray</option>
        </select>

        {/* ✅ Info Button with Hover Tooltip */}
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

      {/* ✅ Validation Error Message */}
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
        value={selectedOptions["Shade Styles"] || ""}
        onChange={(e) => {
          handleOptionChange("Shade Styles", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Shade Styles": e.target.value ? null : "Shade style is required.",
          }));
        }}
      >
        <option value="">--Select Shade Style--</option>
        {optionsData["Shade Styles"].map((option, idx) => (
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
            "Shade styles determine the overall look and functionality of your window treatment. For visual examples and more details, please refer to the product brochure available in the Resources tab."
          )
        }
        onMouseLeave={() => setHoveredInfo(null)}
      >
        ?
      </div>
    </div>
      {/* Validation Error Message */}
      {validationErrors["Shade Styles"] && <p className="error-text">{validationErrors["Shade Styles"]}</p>}
  </div>
)}


{/* ✅ Render Control Options for Natural Shades Separately */}
{selectedProduct === "Natural Shades" ? (
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
      <option value="">--Select Option--</option>
      {selectedOptions["Shade Styles"] === "Hobbled" ? (
        <option value="Loop Control">Loop Control</option>
      ) : (
        optionsData["Control Options"]?.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))
      )}
    </select>

    {/* Validation Error Message - Directly Below Dropdown */}
    {validationErrors["Control Options"] && <p className="error-text">{validationErrors["Control Options"]}</p>}
  </div>
) : (
  /* ✅ Render Control Options for Other Products (Handled Separately) */
  optionsData["Control Options"]?.length > 0 && selectedProduct !== "Natural Shades" && (
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
        <option value="">--Select Option--</option>
        {optionsData["Control Options"].map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* Validation Error Message - Directly Below Dropdown */}
      {validationErrors["Control Options"] && <p className="error-text">{validationErrors["Control Options"]}</p>}
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
        value={selectedOptions["Hardware Options"] || ""}
        onChange={(e) => {
          handleOptionChange("Hardware Options", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Hardware Options": e.target.value ? null : "Hardware option is required for Quick Ship Panels.",
            "Hardware Color": e.target.value ? prevErrors["Hardware Color"] : null, // ✅ Remove Hardware Color error if Hardware Option is deselected
          }));
        }}
      >
        <option value="">--Select Hardware Option--</option>
        {optionsData["Hardware Options"].map((option, idx) => {
          // ✅ Rename options while keeping the correct value
          const renamedOption = {
            "Decorative Pole With Rings": "Decorative Pole",
            "French Return With Rings": "French Return",
            "Decorative Traverse Rod": "Traverse Rod",
          }[option] || option; // Default to original option if not in the mapping

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
  value={selectedOptions["Control Position"] || ""}
  onChange={(e) => {
    handleOptionChange("Control Position", e.target.value);

    // ✅ Reset validation error if user selects a value
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      "Control Position": e.target.value ? null : prevErrors["Control Position"],
    }));
  }}
>
  <option value="">--Select Control Position--</option>
  <option value="Right Side">Right Side</option>
  <option value="Left Side">Left Side</option>
</select>


    {/* Validation Error Message - Directly Below Dropdown */}
    {validationErrors["Control Position"] && <p className="error-text">{validationErrors["Control Position"]}</p>}
  </div>
)}

{/* ✅ Professional-looking Motorization Options */}
{selectedOptions["Control Options"] === "Motorized" && (
  <div className="motorization-options">
    <h4>Motorization Options</h4>
    <div className="motorization-options-grid">
      {optionsData["Motorization Options"]?.map((option, idx) => (
        <label key={idx} className="motorization-checkbox">
          <input
            type="checkbox"
            checked={selectedOptions["Motorization Options"]?.includes(option) ?? false} // ✅ Ensure a default boolean value
            onChange={() => {
              setSelectedOptions((prevOptions) => {
                const updatedOptions = { ...prevOptions };

                // Ensure Motorization Options is always an array
                updatedOptions["Motorization Options"] = updatedOptions["Motorization Options"] || [];

                if (updatedOptions["Motorization Options"].includes(option)) {
                  // ✅ Uncheck (Remove from array)
                  updatedOptions["Motorization Options"] = updatedOptions["Motorization Options"].filter(opt => opt !== option);
                } else {
                  // ✅ Check (Add to array)
                  updatedOptions["Motorization Options"] = [...updatedOptions["Motorization Options"], option];
                }

                return updatedOptions;
              });

              // ✅ Perform validation AFTER state update

            }}
          />
          <span className="custom-checkbox"></span> {/* Custom styling */}
          {option}
        </label>
      ))}
    </div>

    {/* Validation Error Message - Dynamically Changes Based on Product */}
    {validationErrors["Motorization Options"] && (
      <p className="error-text">{validationErrors["Motorization Options"]}</p>
    )}
  </div>
)}




{/* ✅ Hardware Color Dropdown (Only shows if Hardware Option is selected) */}
{selectedOptions["Hardware Options"] && (
  <div className="hardware-color-container">
    <label className="form-label">
      Hardware Color:
      <select
        className="form-select" // ✅ No "error" class, removes red border
        value={selectedOptions["Hardware Color"] || ""}
        onChange={(e) => {
          handleOptionChange("Hardware Color", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Hardware Color": e.target.value ? null : "Hardware color selection is required.",
          }));
        }}
      >
        <option value="">--Select Color--</option>
        <option value="Black">Black</option>
        <option value="Gold">Gold</option>
        <option value="Silver">Silver</option>
      </select>
    </label>

    {/* ✅ Show Error Message Only (Without Red Border) */}
    {validationErrors["Hardware Color"] && <p className="error-text">{validationErrors["Hardware Color"]}</p>}
  </div>
)}

{selectedOptions["Hardware Options"] &&
  !["French Return", "French Return With Rings", ""].includes(selectedOptions["Hardware Options"]) && (
    <div className="finial-options-container">
      <label className="form-label">Finial Options:</label>
      <div className="dropdown-with-info">
        <select
          className={`form-select ${validationErrors["Finial Options"] ? "error" : ""}`}
          value={selectedOptions["Finial Options"] || ""}
          onChange={(e) => handleOptionChange("Finial Options", e.target.value)}
        >
          <option value="">--Select Finial Option--</option>
          <option value="Ball">Ball</option>
          <option value="Square">Square</option>
          <option value="Trumpet">Trumpet</option>
          <option value="Faceted">Faceted</option>
          <option value="Fluted">Fluted</option>
          <option value="End Cap">End Cap</option>
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

      {/* ✅ Debug: Ensure Validation Error Exists */}
      {console.log("🛠️ Finial Options Validation Error:", validationErrors["Finial Options"])}

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
        className="form-select"
        value={selectedOptions["Additional Options"] || ""}
        onChange={(e) => handleOptionChange("Additional Options", e.target.value)}
      >
        <option value="">--Select Option--</option>
        {optionsData["Additional Options"]
          .filter(option => option !== "6 Valence") // ✅ Exclude "Valence"
          .map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
      </select>


          {/* 🎯 Show Decorative Tape Type & Color Dropdowns If "Decorative Tape" is Selected */}
          {selectedOptions["Additional Options"] === "Decorative Tape" && (
        <div className="decorative-tape-selection">
          <label className="form-label">Select Decorative Tape Type:</label>
          <div className="dropdown-with-info">
            <select
              className="form-select"
              value={selectedOptions["Decorative Tape Type"] || ""}
              onChange={(e) => handleOptionChange("Decorative Tape Type", e.target.value)}
            >
              <option value="">--Select Tape Type--</option>
              <option value="Diamond">Diamond</option>
              <option value="Chain">Chain</option>
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

          {/* 🖌 Show Tape Colors If Tape Type is Selected */}
          {selectedOptions["Decorative Tape Type"] && (
            <label className="form-label">
              Select Decorative Tape Color:
              <select
                className="form-select"
                value={selectedOptions["Decorative Tape Color"] || ""}
                onChange={(e) => handleOptionChange("Decorative Tape Color", e.target.value)}
              >
                <option value="">--Select Tape Color--</option>
                {getAvailableColors(selectedOptions["Decorative Tape Type"]).map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
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
      value={selectedOptions["Handle Options"] || ""}
      onChange={(e) => {
        handleOptionChange("Handle Options", e.target.value);
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          "Handle Options": e.target.value ? null : "Handle option is required.",
        }));
      }}
    >
      <option value="">--Select Handle Option--</option>
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
        value={selectedOptions["Hinge Color"] || ""}
        onChange={(e) => {
          handleOptionChange("Hinge Color", e.target.value);
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            "Hinge Color": e.target.value ? null : "Hinge color is required.",
          }));
        }}
      >
        <option value="">--Select Hinge Color--</option>
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

        </div>
      </div>

      {/* Tooltip (Shows on Hover) */}
      {tooltip.visible && (
        <div className="tooltip" style={{ top: tooltip.y, left: tooltip.x }}>
          {tooltip.message}
        </div>
      )}
        
{/* Right Column for Price and Errors */}
{/* 📌 Price Column Section */}
<div className="price-column">
  <div className="right-column-content">

 {/* ✅ Total Price (Rounded without decimals) */}
<div className="total-price">
  <h2>Total Price: ${Math.round(totalPrice)}</h2>
</div>

{/* ✅ Selected Options (Excludes Hardware Options, Motorization Options, & Accessories Message) */}
{Object.keys(selectedOptions).some(categoryKey => 
  selectedOptions[categoryKey] && 
  selectedOptions[categoryKey] !== "None" &&
  !["Mounting Position", "Window Location", "Handle Options", 
    "Hardware Options", "Hardware Color", "Motorization Options"].includes(categoryKey) 
) && (
  <div className="selected-options-pricing">
    <h3>Selected Options:</h3>
    {Object.keys(selectedOptions)
      .filter(categoryKey => 
        selectedOptions[categoryKey] &&  
        selectedOptions[categoryKey] !== "None" && 
        !["Mounting Position", "Window Location", "Handle Options", 
          "Hardware Options", "Hardware Color", "Motorization Options"].includes(categoryKey) 
      )
      .map((categoryKey) => {
        const roundedWidth = Math.ceil(width / 12) * 12 || 0;
        const roundedHeight = Math.ceil(height / 12) * 12 || 0;
        const dimensionKey = `${roundedWidth}x${roundedHeight}`;

        let optionPrice = 0;
        const pricingData = sizeBasedPricing[selectedOptions[categoryKey]];

        if (pricingData !== undefined) {
          if (typeof pricingData === "number") {
            optionPrice = pricingData;
          } else if (typeof pricingData === "object" && pricingData[dimensionKey] !== undefined) {
            optionPrice = pricingData[dimensionKey] || 0;
          }
        }

        return (
          <div key={categoryKey} className="option-price-item">
            <span className="option-name">{categoryKey}: {selectedOptions[categoryKey]}</span>
            {optionPrice > 0 && (
              <span className="option-price">${Math.round(optionPrice * costFactor).toFixed(0)}</span>
            )}
          </div>
        );
      })}

{/* ✅ Ensure "No Extra Charge" message renders correctly */}
{(() => {
  let hasNoChargeOptions = false;

  Object.keys(selectedOptions).forEach(categoryKey => {
    const selectedOption = selectedOptions[categoryKey];

    // Ignore hardware-related categories
    if (["Hardware Options", "Hardware Color", "Finial Options"].includes(categoryKey)) {
      return;
    }

    // Get the size-based pricing data
    const pricingData = sizeBasedPricing[selectedOption];

    let optionPrice = 0;

    if (pricingData !== undefined) {
      if (typeof pricingData === "number") {
        optionPrice = pricingData;
      } else if (
        typeof pricingData === "object" &&
        pricingData[dimensionKey] !== undefined
      ) {
        optionPrice = pricingData[dimensionKey] || 0;
      }
    }

    if (optionPrice === 0 || optionPrice === null) {
      hasNoChargeOptions = true;
    }
  });

  return hasNoChargeOptions ? (
    <p className="no-extra-charge-message">
      *Options listed without a price are included at no additional charge.
    </p>
  ) : null;
})()}




  </div>
)}


 {/* ✅ Quantity Selection (Fixes alignment) */}
 <div className="quantity-container">
      <label className="form-label">
        Quantity:
        <input
          type="number"
          value={selectedProduct ? quantity : 1}
          onChange={handleQuantityChange}
          min="1"
          className="form-input"
        />
      </label>
    </div>

{/* ✅ Hardware Accessories Section */}
{selectedOptions["Hardware Options"] && (
  <div className="hardware-accessories">
    <h3>Hardware Accessories</h3>
    
    {/* ✅ Show the Main Hardware Option */}
    <div className="option-price-item">
      <span className="option-name">
        {selectedOptions["Hardware Options"] === "Decorative Pole With Rings"
          ? "Decorative Pole"
          : selectedOptions["Hardware Options"] === "French Return With Rings"
          ? "French Return"
          : selectedOptions["Hardware Options"] === "Decorative Traverse Rod"
          ? "Traverse Rod"
          : selectedOptions["Hardware Options"]}
      </span>

      {/* ✅ Ensure price updates correctly but does NOT scale with quantity */}
      {(() => {
        const roundedWidth = Math.ceil(width / 12) * 12 || 0;
        const roundedHeight = Math.ceil(height / 12) * 12 || 0;
        const dimensionKey = `${roundedWidth}x${roundedHeight}`;

        let hardwarePrice = 0;
        const pricingData = sizeBasedPricing[selectedOptions["Hardware Options"]];

        if (pricingData !== undefined) {
          if (typeof pricingData === "number") {
            hardwarePrice = pricingData;
          } else if (typeof pricingData === "object" && pricingData[dimensionKey] !== undefined) {
            hardwarePrice = pricingData[dimensionKey] || 0;
          }
        }

        return hardwarePrice > 0 ? <span className="option-price">${Math.round(hardwarePrice * costFactor).toFixed(0)}</span> : null;
      })()}
    </div>




    {/* ✅ Show Hardware Color */}
    {selectedOptions["Hardware Color"] && (
      <div className="option-price-item">
        <span className="option-name">Color: {selectedOptions["Hardware Color"]}</span>
      </div>
    )}

    {/* ✅ Show Finial Options (Only if NOT French Return) */}
    {selectedOptions["Hardware Options"] !== "French Return" && selectedOptions["Finial Options"] && (
      <div className="option-price-item">
        <span className="option-name">Finial: {selectedOptions["Finial Options"]}</span>
      </div>
    )}

    {/* ✅ Ensure the Accessories Message ONLY Renders Once */}
    <p className="accessory-info-message">
      *Accessories are priced separately and do not multiply with the selected quantity.
    </p>
  </div>
)}


{/* ✅ Motorization & Manual Crank Accessories Section */}
<div className="motorization-subtotal">
  {/* ✅ Ensure the heading changes dynamically */}
  {selectedOptions["Control Options"] === "Manual Crank" && (
    <h3>Manual Crank Accessories</h3>
  )}

  {/* ✅ Show Handle Option If "Manual Crank" is Selected */}
  {selectedOptions["Control Options"] === "Manual Crank" &&
  selectedOptions["Handle Options"] && (
    <div className="option-price-item">
      <span className="option-name">{selectedOptions["Handle Options"]}</span>
      <span className="option-price">
        ${Math.round(27 * costFactor.toFixed(0))} {/* Apply cost factor dynamically */}
      </span>
    </div>
)}

{/* ✅ Ensure Motorization Accessories Render Properly */}
{selectedOptions["Control Options"] === "Motorized" && (
  <div className="motorization-accessories">
    <h3>Motorization Accessories:</h3>
    {Array.isArray(selectedOptions["Motorization Options"]) &&
    selectedOptions["Motorization Options"].length > 0 ? (
      selectedOptions["Motorization Options"].map((option) => {
        // ✅ Fetch price from sizeBasedPricingData instead of optionsData
        const optionPrice = sizeBasedPricingData[option] || 0;

        console.log(`🔍 Rendering Motorization Accessory: ${option} -> $${optionPrice}`);

        return (
          <div key={option} className="option-price-item">
            <span className="option-name">{option}</span>
            {optionPrice > 0 && (
              <span className="option-price">${(optionPrice * costFactor).toFixed(0)}</span>
            )}
          </div>
        );
      })
    ) : (
      <p>No motorization accessories selected.</p>
    )}
  </div>
)}








{/* ✅ Show general accessories message when a Control Option is selected */}
{["Manual Crank", "Motorized"].includes(selectedOptions["Control Options"]) && (
  <p className="accessory-info-message">
    *Accessories are priced separately and do not multiply with the selected quantity.
  </p>
)}

{/* ✅ Show specific messages based on Control Option & Product */}
<p className="accessory-info-message1">
  {selectedOptions["Control Options"] === "Manual Crank"
    ? "*At least (1) Crank Handle is required per order."
    : selectedOptions["Control Options"] === "Motorized" &&
      selectedProduct === "Patio Shades"
    ? "*At least (1) Remote is required per order when ordering Motorized Patio Shades."
    : selectedOptions["Control Options"] === "Motorized"
    ? "*At least (1) Remote and (1) Charger are required per order."
    : ""}
</p> 
</div>


<div>
{/* ✅ Add Item to Quote Button */}
<div className="quote-actions">
  <button className="add-to-quote-btn" onClick={handleSaveItem}>
    Add Item to Quote
  </button>

  {/* ✅ Always show "Go to Quote" when a quote ID exists */}
  {currentQuoteId && (
    <button className="go-to-quote-btn" onClick={() => navigate(`/quote/${currentQuoteId}`)}>
      Go to Quote
    </button>
  )}
</div>





{showAlert && (
  <CustomAlert
    message="Your item has been added to the quote."
    onAddMore={handleAddMoreItems} // ✅ Reset form & keep adding items
    onGoToQuote={() => navigate(`/quote/${currentQuoteId}`)}
  />
)}



    </div>


  </div>
</div>



      </div>

      
  ); 
};

export default QuotingPage;
