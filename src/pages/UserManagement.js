import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // ✅ Import Firebase services
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./UserManagement.css"; // ✅ Custom styles

const UserManagement = () => {
  const [users, setUsers] = useState([]); // ✅ Store users
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "Standard" });

  // ✅ Fetch Users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  // ✅ Handle User Creation
  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // ✅ Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const userId = userCredential.user.uid;

      // ✅ Step 2: Store user data in Firestore
      await setDoc(doc(db, "users", userId), {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date(),
      });

      // ✅ Step 3: Refresh UI
      setUsers([...users, { id: userId, ...newUser }]);
      setNewUser({ name: "", email: "", password: "", role: "Standard" });

      alert("User added successfully!");
    } catch (error) {
      console.error("❌ Error adding user:", error.message);
      alert("Failed to add user. Try again.");
    }
  };

  // ✅ Handle User Deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(user => user.id !== userId));
      alert("User deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting user:", error.message);
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="user-management-container">
      <h2>User Management</h2>

      {/* ✅ User Input Form */}
      <div className="user-form">
        <input
          type="text"
          placeholder="Full Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="Admin">Admin</option>
          <option value="Installer">Installer</option>
          <option value="Standard">Standard (Sales & Designers)</option>
        </select>
        <button onClick={handleAddUser}>Add User</button>
      </div>

      {/* ✅ User List */}
      <h3>Existing Users</h3>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>❌ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
