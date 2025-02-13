const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


// Helper function to upload Products to Firestore
async function uploadProducts(filePath) {
    const products = [];
  
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const productId = row['productId'];
  
          // Clean and parse the sizeBasedPricing
          const sizeBasedPricingRaw = row['sizeBasedPricing'];
          let sizeBasedPricing = {};
  
          if (sizeBasedPricingRaw) {
            try {
              // Fix the formatting of the sizeBasedPricing string to valid JSON
              const fixedPricing = sizeBasedPricingRaw
                .replace(/([a-zA-Z0-9]+x[a-zA-Z0-9]+):/g, '"$1":') // Add quotes around the keys (e.g., "24x36":)
                .replace(/,/g, ', ') // Ensure proper spacing after commas
                .replace(/(\d+)\s*$/g, '$1'); // Remove trailing spaces or issues
  
              sizeBasedPricing = JSON.parse(fixedPricing);
            } catch (error) {
              console.error(`Error fixing sizeBasedPricing for product ${productId}:`, error);
            }
          }
  
          // Ensure pricingRulesId is valid
          const pricingRulesId = row['pricingRules'] ? row['pricingRules'].toLowerCase().trim() : null;
  
          // Handle case where pricingRulesId is not provided
          if (!pricingRulesId) {
            console.warn(`Missing pricingRulesId for productId ${productId}`);
          }
  
          // Update for the new headers: fabricCollectionOptions, fabricColorOptions, and options
          products.push({
            productId: productId,
            name: row['name'],
            description: row['description'],
            category: row['category'],
            fabricCollectionOptions: row['fabricCollectionOptions'] ? row['fabricCollectionOptions'].split(',').map((option) => option.trim()) : [],
            fabricColorOptions: row['fabricColorOptions'] ? row['fabricColorOptions'].split(',').map((color) => color.trim()) : [],
            pricingRulesId: pricingRulesId,
            options: row['options'] ? row['options'].split(',').map((option) => option.trim()) : [],
            sizeBasedPricing: sizeBasedPricing, // Store the cleaned sizeBasedPricing
          });
        })
        .on('end', async () => {
          try {
            for (const product of products) {
              if (product.pricingRulesId) {
                await db.collection('products').doc(product.productId).set({
                  name: product.name,
                  description: product.description,
                  category: product.category,
                  fabricCollectionOptions: product.fabricCollectionOptions,
                  fabricColorOptions: product.fabricColorOptions,
                  pricingRules: db.collection('pricingRules').doc(product.pricingRulesId),
                  options: product.options.map(option => db.collection('options').doc(option)),
                  sizeBasedPricing: product.sizeBasedPricing, // Upload the cleaned pricing data
                });
                console.log(`Uploaded Product: ${product.name}`);
              } else {
                console.log(`Skipped Product: ${product.name} due to missing pricingRulesId`);
              }
            }
            resolve();
          } catch (error) {
            reject(`Error uploading products: ${error}`);
          }
        });
    });
  }
  
  
 async function uploadPricingRules(filePath) {
  const pricingRules = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const pricingRulesId = row['pricingRulesId'].toLowerCase().replace(/\s+/g, ''); // Clean the pricingRulesId
        const widthHeightPricing = row['widthHeightPricing'];

        let parsedWidthHeightPricing = {};
        let parsedAdditionalOptions = {};

        // Check if widthHeightPricing is valid JSON
        try {
          if (widthHeightPricing) {
            parsedWidthHeightPricing = JSON.parse(widthHeightPricing);
          }
        } catch (error) {
          console.warn(`Invalid JSON in widthHeightPricing for ${pricingRulesId}:`, widthHeightPricing);
        }

        pricingRules.push({
          pricingRulesId: pricingRulesId,
          basePrice: parseFloat(row['basePrice']),
          widthHeightPricing: parsedWidthHeightPricing,
        });
      })
      .on('end', async () => {
        try {
          // Upload the pricing rules to Firestore
          for (const rule of pricingRules) {
            const docRef = db.collection('pricingRules').doc(rule.pricingRulesId); // Use pricingRulesId as document ID
            await docRef.set({
              basePrice: rule.basePrice,
              widthHeightPricing: rule.widthHeightPricing,
            });
            console.log(`Uploaded Pricing Rule: ${rule.pricingRulesId}`);
          }
          resolve();
        } catch (error) {
          reject(`Error uploading pricing rules: ${error}`);
        }
      });
  });
}

// Helper function to upload Fabric Options to Firestore
async function uploadOptions(filePath) {
    const options = [];
  
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const optionId = row['optionsId'].toLowerCase().replace(/\s+/g, ''); // Clean the optionsId
          
          // Parse the sizeBasedPricing as a JSON object
          let sizeBasedPricing = null;
          try {
            if (row['sizeBasedPricing']) {
              sizeBasedPricing = JSON.parse(row['sizeBasedPricing']);
            }
          } catch (error) {
            console.error(`Error parsing sizeBasedPricing for optionId ${optionId}: ${row['sizeBasedPricing']}`);
            console.error(error);
          }
  
          // Push the option data to the array
          options.push({
            optionId: optionId,
            products: row['products'],  // Assuming 'products' is the associated product(s)
            optionCategory: row['optionCategory'],
            optionName: row['optionName'],
            sizeBasedPricing: sizeBasedPricing,
          });
        })
        .on('end', async () => {
          try {
            // Upload the options to Firestore
            for (const option of options) {
              const docRef = db.collection('options').doc(option.optionId); // Use optionId as document ID
              await docRef.set({
                products: option.products,
                optionCategory: option.optionCategory,
                optionName: option.optionName,
                sizeBasedPricing: option.sizeBasedPricing,
              });
              console.log(`Uploaded Option: ${option.optionName}`);
            }
            resolve();
          } catch (error) {
            reject(`Error uploading options: ${error}`);
          }
        });
    });
  }
  

// Main function to execute the upload process
async function main() {
    try {
      await uploadOptions('./options.csv');
      await uploadPricingRules('./pricingRules.csv');
      await uploadProducts('./products.csv');  // Ensure this line is included
      console.log('All data uploaded successfully!');
    } catch (error) {
      console.error('Error during upload:', error);
    }
  }
  

main();
