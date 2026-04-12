import React from 'react';
import './DashboardTable.css';

function DashboardTable() {
  return (
    <div className="dashboard-table">
      <table>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Sidemark</th>
            <th>Status</th>
            <th>Tracking Information</th>
          </tr>
        </thead>
        <tbody>
          {/* Sample rows */}
          <tr>
            <td>John Doe</td>
            <td>Living Room Blinds</td>
            <td>Processing</td>
            <td>UPS #123456</td>
          </tr>
          <tr>
            <td>Jane Smith</td>
            <td>Bedroom Shades</td>
            <td>Shipped</td>
            <td>FedEx #789101</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default DashboardTable;
