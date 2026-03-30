import React, { useState, useEffect } from 'react';
import EmployeeList from './EmployeeList';
import WeeklyCalendar from './WeeklyCalendar';
import './styles.css';

const CuterusDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [dateRange, setDateRange] = useState([]);

  // Generate date range for the current week (Monday to Sunday)
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Monday of current week
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    setDateRange(dates);
  }, []);

  // Mock data - in a real app, this would come from Firebase/Firestore
  useEffect(() => {
    const mockEmployees = [
      {
        id: 1,
        name: "Employee A",
        employeeCode: "E001",
        cycleData: {
          periodDays: [1, 2, 3, 28, 29, 30], // Example period days in cycle
          currentDay: 2,
          cycleLength: 28
        }
      },
      {
        id: 2,
        name: "Employee B",
        employeeCode: "E002",
        cycleData: {
          periodDays: [5, 6, 7],
          currentDay: 4,
          cycleLength: 30
        }
      },
      {
        id: 3,
        name: "Employee C",
        employeeCode: "E003",
        cycleData: {
          periodDays: [12, 13, 14],
          currentDay: 10,
          cycleLength: 28
        }
      }
    ];
    
    setEmployees(mockEmployees);
  }, []);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleDateHover = (date) => {
    setHoveredDate(date);
  };

  const handleDateLeave = () => {
    setHoveredDate(null);
  };

  return (
    <div className="dashboard-container">
      <h1>Cuterus Cycle Monitoring Dashboard</h1>
      <p>Read-only view for authorized female staff</p>
      
      <div className="dashboard-content">
        <EmployeeList 
          employees={employees} 
          onEmployeeSelect={handleEmployeeSelect} 
          selectedEmployee={selectedEmployee}
        />
        
        <WeeklyCalendar 
          employees={employees} 
          dateRange={dateRange}
          selectedEmployee={selectedEmployee}
          hoveredDate={hoveredDate}
          onDateHover={handleDateHover}
          onDateLeave={handleDateLeave}
        />
      </div>
      
      {selectedEmployee && (
        <div className="detail-popup">
          <button className="close-btn" onClick={() => setSelectedEmployee(null)}>×</button>
          <h3>{selectedEmployee.name}'s Cycle Details</h3>
          <p><strong>Employee Code:</strong> {selectedEmployee.employeeCode}</p>
          <p><strong>Current Cycle Day:</strong> {selectedEmployee.cycleData.currentDay}</p>
          <p><strong>Cycle Length:</strong> {selectedEmployee.cycleData.cycleLength} days</p>
          <p><strong>Period Days:</strong> {selectedEmployee.cycleData.periodDays.join(', ')}</p>
          {!selectedEmployee.selected && (
            <p><em>Click on calendar dates to see specific day details</em></p>
          )}
        </div>
      )}
    </div>
  );
};

export default CuterusDashboard;