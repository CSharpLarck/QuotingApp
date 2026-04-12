import { collection, getDocs } from "firebase/firestore";
import { db } from "../frontend/src/firebase";

async function fetchProducts() {
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
    });
}

fetchProducts();
