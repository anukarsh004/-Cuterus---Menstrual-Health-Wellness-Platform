import React from 'react';

const EmployeeList = ({ employees, onEmployeeSelect, selectedEmployee }) => {
  return (
    <div className="employee-list">
      <h2>Employees</h2>
      <ul>
        {employees.map(employee => (
          <li 
            key={employee.id}
            className={`employee-name ${selectedEmployee && selectedEmployee.id === employee.id ? 'selected' : ''}`}
            onClick={() => onEmployeeSelect(employee)}
            data-employee-code={employee.employeeCode}
          >
            {employee.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeList;