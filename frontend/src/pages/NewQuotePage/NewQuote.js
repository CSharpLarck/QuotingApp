import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, auth, updateDoc, query, where, doc, setDoc, getDoc, serverTimestamp } from '../../firebase'; // Assuming firebase is already set up
import './NewQuote.css';
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom"; // ✅ Import useParams
import { v4 as uuidv4 } from "uuid"; // ✅ Import UUID for unique Quote IDs
import CustomerInfoForm from "../../components/CustomerInfoForm.js";
import ProductSelector from "../../components/ProductSelector.js";
import DimensionsForm from "../../components/DimensionsForm.js";
import InstallationDetailsForm from "../../components/InstallationDetailsForm.js";
import FabricSelector from "../../components/FabricSelector.js";
import PricingSummary from "../../components/PricingSummary.js";




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

  const [optionsData, setOptionsData] = useState({}); // Store options categorized by product
  const [sizeBasedPricing, setSizeBasedPricing] = useState(new Map());
  const [sizeBasedPricingData, setSizeBasedPricingData] = useState({});
  const [quantity, setQuantity] = useState(1); // Default quantity is 1
  const [, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [, setShowAlert] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentQuoteId, setCurrentQuoteId] = useState(null); // ✅ Store Quote ID
  const [, setHoveredInfo] = useState(null);   
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
  const [itemToEdit] = useState(null);
  const [mountingPosition, setMountingPosition] = useState("");
  const [windowLocation, setWindowLocation] = useState("");


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
        setCategories(uniqueCategories);
      } catch (error) {
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
        return;
      }
  
      const user = auth.currentUser; // ✅ Get logged-in user
      if (!user) {
        navigate("/signin"); // ✅ Redirect unauthenticated users
        return;
      }
  
      try {
        const quoteRef = doc(db, "quotes", quoteId);
        const quoteSnap = await getDoc(quoteRef);
  
        if (quoteSnap.exists()) {
          const data = quoteSnap.data();
  
          // ✅ Check if the current user is the creator
          if (data.createdBy !== user.uid) {
            navigate("/unauthorized"); // ✅ Redirect unauthorized users
            return;
          }
  
          setCustomerName(data.customerName || "");
          setPoNumber(data.poNumber || "");
          setSidemark(data.sidemark || "");
          setAddress(data.address || "");
          setPhoneNumber(data.phoneNumber || "");
       } else {
  resetAllInputs();
  setCustomerName("");
  setPoNumber("");
  setSidemark("");
  setAddress("");
  setPhoneNumber("");
  setCurrentQuoteId(quoteId);
  setHasAddedItem(false);
}
      } catch (error) {
      }
    };
  
    fetchQuoteData();
  }, [quoteId, navigate]); // ✅ Added `navigate` to dependencies
  


















  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
  
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const userData = userSnap.data();
  
          const parsedCostFactor = parseFloat(userData.CostFactor);
          setCostFactor(!isNaN(parsedCostFactor) ? parsedCostFactor : 1);
        } else {
        }
      } catch (error) {
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

const handleSaveItem = async () => {
  let errors = validateForm(); // ✅ Run validation and get errors object

  if (Object.keys(errors).length > 0) {
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
    width,
    widthFraction,
    height,
    heightFraction,
    quantity,
   mountingPosition: mountingPosition || "N/A",
    windowLocation: windowLocation || "N/A",
    fabricOption: selectedFabricOption || "N/A",
    fabricColor: selectedFabricColorOption || "N/A",
    totalPrice: Math.round(totalPrice),
    suggestedRetailPrice: Math.round(suggestedRetailPrice),
  };
  
  try {
    const quoteRef = doc(db, "quotes", quoteToUpdateId);
    const quoteSnap = await getDoc(quoteRef);
    
    
    let quoteData = { items: [] }; // Default if no quote exists
    if (quoteSnap.exists()) {
      quoteData = quoteSnap.data(); // Retrieve existing quote data
    }

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
    

    // ✅ Ensure re-render by setting states **AFTER** Firestore update
    localStorage.setItem("hasAddedItem", "true");

    localStorage.setItem("currentQuoteId", quoteToUpdateId);
    setCurrentQuoteId(quoteToUpdateId);
    setHasAddedItem(true); // ✅ Trigger "Go to Quote" button
    setShowAlert(true);
  } catch (error) {
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

  // Customer information
  if (!customerName.trim()) errors.customerName = "Customer name is required.";
  if (!sidemark.trim()) errors.sidemark = "Sidemark is required.";
  if (!address.trim()) errors.address = "Address is required.";
  if (!phoneNumber.trim()) errors.phoneNumber = "Phone Number is required.";

  // Product information
  if (!selectedCategory) errors.selectedCategory = "Category is required.";
  if (!selectedProduct) errors.selectedProduct = "Product is required.";

  // Window location
  if (!windowLocation.trim()) {
  errors["Window Location"] = "Window location is required.";
}

  // Width and height
  if (
    selectedCategory &&
    selectedProduct &&
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

  // Mounting position
  const productsRequiringMountingPosition = [
    "Roller Shades",
    "2.5 Faux Wood Blinds",
    "2 Faux Wood Blinds",
    "Natural Shades",
  ];

if (
  productsRequiringMountingPosition.includes(selectedProduct) &&
  !mountingPosition.trim()
) {
  errors["Mounting Position"] = "Mounting position is required.";
}


   // Roller Shades rules
  if (selectedProduct === "Roller Shades") {
    const widthVal = (parseFloat(width) || 0) + calculateInches(0, widthFraction);

    if (widthVal > 108) {
      errors.width = "Maximum width for Roller Shades is 108 inches.";
    }
  }

  if (Object.keys(errors).length > 0) {
    console.warn("Validation Errors:", errors);
  }

  setValidationErrors(errors);
  return errors;
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
}, [selectedCategory]);




const handleProductChange = (e) => {
  const newProduct = e.target.value;
  setSelectedProduct(newProduct);
  setValidationErrors({}); 
  // ✅ Reset only relevant options for the new product
  const newOptions = {};
  Object.keys(optionsData).forEach((optionCategory) => {
    if (optionsData[optionCategory].includes(newProduct)) {
      newOptions[optionCategory] = "";
    }
  });

  setSelectedOptions(newOptions);
  setQuantity(1); 
};


  
  
  
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initialSelectedOptions = {};
    Object.keys(optionsData).forEach((categoryKey) => {
      initialSelectedOptions[categoryKey] = '';  // Default value for each category
    });
    return initialSelectedOptions;
  });


useEffect(() => {
  if (itemToEdit && productsData.length > 0 && !hasPrefilledProduct) {
    const matchingProduct = productsData.find((p) => p.name === itemToEdit.product);

    if (matchingProduct) {
      setSelectedProduct(itemToEdit.product || "");
      fetchOptions(matchingProduct.optionRefs);
    }

    setWidth(itemToEdit.width || "");
    setWidthFraction(itemToEdit.widthFraction || "");
    setHeight(itemToEdit.height || "");
    setHeightFraction(itemToEdit.heightFraction || "");
    setQuantity(itemToEdit.quantity || 1);
    setSelectedFabricOption(itemToEdit.fabricOption || "");
    setSelectedFabricColorOption(itemToEdit.fabricColor || "");
    setWindowLocation(itemToEdit.windowLocation || "");
    setMountingPosition(itemToEdit.mountingPosition || "");

    setSelectedOptions({
      ...(itemToEdit.mountingPosition && {
        "Mounting Position": itemToEdit.mountingPosition,
      }),
      ...(itemToEdit.windowLocation && {
        "Window Location": itemToEdit.windowLocation,
      }),
    });

    setHasPrefilledProduct(true);
  }
}, [itemToEdit, productsData, hasPrefilledProduct]);


  

  const handleUpdateItem = async () => {
  const errors = validateForm();

  if (Object.keys(errors).length > 0) {
    console.warn("Validation failed. Fix errors before updating.", errors);
    setValidationErrors(errors);
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
    mountingPosition: mountingPosition || "N/A",
    windowLocation: windowLocation || "N/A",
    totalPrice: Math.round(totalPrice),
    suggestedRetailPrice: Math.round(suggestedRetailPrice),
  };

  items[numericEditItemIndex] = updatedItem;

  await updateDoc(quoteRef, { items });
  setShowAlert(true);

  navigate(`/quote/${quoteId}`);
};


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
  setPricingRules(new Map());
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


// Check if products state updates correctly
useEffect(() => {
  console.log("Updated Products State:", products);
}, [products]);

useEffect(() => {
  const fetchProductsByCategory = async () => {
    if (!selectedCategory) return;

    setOptionsData({});

    try {
      const productsRef = collection(db, "products");
      const productsQuery = query(
        productsRef,
        where("category", "==", selectedCategory)
      );

      const querySnapshot = await getDocs(productsQuery);

      if (querySnapshot.empty) {
        setProducts([]);
        setProductsData([]);
        return;
      }

      const fetchedProducts = querySnapshot.docs.map((doc) => doc.data());

      const uniqueProducts = [
        ...new Map(
          fetchedProducts.map((product) => [product.name, product])
        ).values(),
      ];

      const formattedProductsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          productId: doc.id,
          name: data.name,
          fabricCollectionOptions: data.fabricCollectionOptions || [],
          fabricColorOptions: Array.isArray(data.fabricColorOptions)
            ? data.fabricColorOptions
            : [],
          pricingRules: data.pricingRules || {},
          optionRefs: data.options || [],
        };
      });

      setProducts(uniqueProducts);
      setProductsData(formattedProductsData);

      const selectedProductData = formattedProductsData.find((product) =>
        selectedFabricOption
          ? product.fabricCollectionOptions.includes(selectedFabricOption)
          : product.name === selectedProduct
      );

      if (selectedProductData?.optionRefs?.length > 0) {
        await fetchOptions(selectedProductData.optionRefs);
      }
    } catch (error) {
      console.error("Error fetching products data:", error);
    }
  };

  fetchProductsByCategory();
}, [selectedCategory, selectedFabricOption, selectedProduct]);


useEffect(() => {
  if (!selectedCategory || !selectedProduct) return;

  const selectedCategoryProducts = productsData.filter(
    (product) => product.name === selectedProduct
  );

  const fabricOptions = new Set();

  selectedCategoryProducts.forEach((product) => {
    product.fabricCollectionOptions.forEach((option) => {
      fabricOptions.add(option);
    });
  });

  setFabricCollectionOptions([...fabricOptions]);
}, [selectedProduct, selectedCategory, productsData]);

useEffect(() => {
  if (!totalPrice || !costFactor || isNaN(costFactor) || costFactor === 0) return;

  setSuggestedRetailPrice(totalPrice / costFactor);
}, [totalPrice, costFactor]);

const fetchPricingRules = async (selectedProductData) => {
  try {
    const pricingDocRef = selectedProductData.pricingRules;
    const pricingDocSnapshot = await getDoc(pricingDocRef);

    if (!pricingDocSnapshot.exists()) {
      console.error("No pricing rules document found for selected product");
      return;
    }

    const pricingData = pricingDocSnapshot.data();

    if (!pricingData?.widthHeightPricing) {
      console.error("Width/height pricing data not found");
      return;
    }

    const rulesArray = Array.isArray(pricingData.widthHeightPricing)
      ? pricingData.widthHeightPricing.map((rule) => ({
          dimension: rule.dimension,
          price: rule.price,
        }))
      : Object.entries(pricingData.widthHeightPricing).map(
          ([dimension, price]) => ({
            dimension,
            price,
          })
        );

    const pricingMap = new Map(
      rulesArray.map((rule) => [rule.dimension, rule.price])
    );

    setPricingRules(pricingMap);

    const updatedMinMax = rulesArray.reduce(
      (acc, rule) => {
        const [width, height] = rule.dimension.split("x").map(Number);

        if (!isNaN(width) && !isNaN(height)) {
          acc.minWidth = Math.min(acc.minWidth, width);
          acc.maxWidth = Math.max(acc.maxWidth, width);
          acc.minHeight = Math.min(acc.minHeight, height);
          acc.maxHeight = Math.max(acc.maxHeight, height);
        }

        return acc;
      },
      {
        minWidth: Infinity,
        maxWidth: -Infinity,
        minHeight: Infinity,
        maxHeight: -Infinity,
      }
    );

    setMinMaxDimensions({
      minWidth: isFinite(updatedMinMax.minWidth) ? updatedMinMax.minWidth : 24,
      maxWidth: isFinite(updatedMinMax.maxWidth) ? updatedMinMax.maxWidth : 120,
      minHeight: isFinite(updatedMinMax.minHeight) ? updatedMinMax.minHeight : 24,
      maxHeight: isFinite(updatedMinMax.maxHeight) ? updatedMinMax.maxHeight : 120,
    });
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
  }
};



useEffect(() => {
  const widthInches =
    isNaN(parseFloat(width)) ? 0 : parseFloat(width) + calculateInches(0, widthFraction);

  if (
    widthInches < minMaxDimensions.minWidth ||
    widthInches > minMaxDimensions.maxWidth
  ) {
    setValidationErrors((prev) => ({
      ...prev,
      width: `Width must be between ${minMaxDimensions.minWidth} and ${minMaxDimensions.maxWidth} inches.`,
    }));
  } else {
    setValidationErrors((prev) => {
      const { width, ...rest } = prev;
      return rest;
    });
  }
}, [width, widthFraction, minMaxDimensions]);
  
  useEffect(() => {
  const heightInches =
    isNaN(parseFloat(height)) ? 0 : parseFloat(height) + calculateInches(0, heightFraction);

  if (
    heightInches < minMaxDimensions.minHeight ||
    heightInches > minMaxDimensions.maxHeight
  ) {
    setValidationErrors((prev) => ({
      ...prev,
      height: `Height must be between ${minMaxDimensions.minHeight} and ${minMaxDimensions.maxHeight} inches.`,
    }));
  } else {
    setValidationErrors((prev) => {
      const { height, ...rest } = prev;
      return rest;
    });
  }
}, [height, heightFraction, minMaxDimensions]);
  



useEffect(() => {
  if (!selectedProduct || pricingRules.size === 0) return;

  const widthInches =
    parseFloat(width || 0) + calculateInches(0, widthFraction);

  const heightInches =
    parseFloat(height || 0) + calculateInches(0, heightFraction);

  const roundedWidth = Math.ceil(widthInches / 12) * 12;
  const roundedHeight = Math.ceil(heightInches / 12) * 12;
  const dimensionKey = `${roundedWidth}x${roundedHeight}`;

  const basePrice = pricingRules.get(dimensionKey);

  if (basePrice === undefined) {
    setTotalPrice(0);
    return;
  }

  const finalTotal = basePrice * quantity * costFactor;

  setTotalPrice(finalTotal);
}, [
  selectedProduct,
  width,
  height,
  widthFraction,
  heightFraction,
  pricingRules,
  quantity,
  costFactor,
]);

  
  useEffect(() => {
    setFabricColorOptions([]);
    setPricingRules(new Map());
  
    if (!selectedFabricOption || !selectedProduct) return;
  
    // Step 1: Find the selected product in productsData
    const selectedProductData = productsData.find(
      (product) =>
        product.name === selectedProduct &&
        product.fabricCollectionOptions.includes(selectedFabricOption)
    );
  
    if (!selectedProductData) {
      return;
    }
  
    // Step 2: Set fabric color options
    const fabricColorOptionsData = selectedProductData.fabricColorOptions || [];
    setFabricColorOptions(fabricColorOptionsData);
  
  
    // Step 3: Fetch pricing rules for this product
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
 
<CustomerInfoForm
  customerName={customerName}
  setCustomerName={setCustomerName}
  sidemark={sidemark}
  setSidemark={setSidemark}
  address={address}
  setAddress={setAddress}
  phoneNumber={phoneNumber}
  setPhoneNumber={setPhoneNumber}
  validationErrors={validationErrors}
  setValidationErrors={setValidationErrors}
/>

    
    {/* Left Column for Product Configuration */}
    <div className="product-column">
      <h2 className="title">Quoting Details</h2>

<ProductSelector
  categories={categories}
  products={products}
  selectedCategory={selectedCategory}
  selectedProduct={selectedProduct}
  validationErrors={validationErrors}
  handleCategoryChange={handleCategoryChange}
  handleProductChange={handleProductChange}
  formatProductName={formatProductName}
/>



<FabricSelector
  selectedCategory={selectedCategory}
  fabricCollectionOptions={fabricCollectionOptions}
  selectedFabricOption={selectedFabricOption}
  setSelectedFabricOption={setSelectedFabricOption}
  fabricColorOptions={fabricColorOptions}
  selectedFabricColorOption={selectedFabricColorOption}
  setSelectedFabricColorOption={setSelectedFabricColorOption}
  validationErrors={validationErrors}
  setValidationErrors={setValidationErrors}
  handleMouseEnter={handleMouseEnter}
  setHoveredInfo={setHoveredInfo}
/>


 <DimensionsForm
  width={width}
  setWidth={setWidth}
  widthFraction={widthFraction}
  setWidthFraction={setWidthFraction}
  height={height}
  setHeight={setHeight}
  heightFraction={heightFraction}
  setHeightFraction={setHeightFraction}
  validationErrors={validationErrors}
  setValidationErrors={setValidationErrors}
  fractions={fractions}
/>
<InstallationDetailsForm
  mountingPosition={mountingPosition}
  setMountingPosition={setMountingPosition}
  windowLocation={windowLocation}
  setWindowLocation={setWindowLocation}
  validationErrors={validationErrors}
  setValidationErrors={setValidationErrors}
/>

</div>

<PricingSummary
  totalPrice={totalPrice}
  selectedOptions={selectedOptions}
  optionsData={optionsData}
  sizeBasedPricing={sizeBasedPricing}
  sizeBasedPricingData={sizeBasedPricingData}
  width={width}
  height={height}
  costFactor={costFactor}
  selectedProduct={selectedProduct}
  quantity={quantity}
  handleQuantityChange={handleQuantityChange}
  isEditMode={isEditMode}
  handleUpdateItem={handleUpdateItem}
  handleSaveItem={handleSaveItem}
  hasAddedItem={hasAddedItem}
  currentQuoteId={currentQuoteId}
  navigate={navigate}
/>

</div>
  );
};

export default QuotingPage;
