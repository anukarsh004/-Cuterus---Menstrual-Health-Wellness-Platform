import React from 'react';

const WeeklyCalendar = ({ employees, dateRange, selectedEmployee, hoveredDate, onDateHover, onDateLeave }) => {
  // Format day of week (Mon, Tue, etc.)
  const getDayName = (date) => {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  };

  // Format date (Mar 28)
  const getDateString = (date) => {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Check if a given date is a period day for an employee
  const isPeriodDay = (employee, date) => {
    if (!employee.cycleStartDate) return false;
    
    // Calculate days between cycle start and current date
    const timeDiff = date.getTime() - employee.cycleStartDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // Handle negative differences (dates before cycle start) by showing previous cycle
    // We use modulo to wrap around the cycle
    const cycleDay = ((dayDiff % employee.cycleData.cycleLength) + employee.cycleData.cycleLength) % employee.cycleData.cycleLength + 1;
    
    return employee.cycleData.periodDays.includes(cycleDay);
  };

  // Get period day number (1,2,3) for styling
  const getPeriodDayNumber = (employee, date) => {
    if (!employee.cycleStartDate) return null;
    
    const timeDiff = date.getTime() - employee.cycleStartDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const cycleDay = ((dayDiff % employee.cycleData.cycleLength) + employee.cycleData.cycleLength) % employee.cycleData.cycleLength + 1;
    
    // Return the day number if it's a period day, otherwise null
    return employee.cycleData.periodDays.includes(cycleDay) ? cycleDay : null;
  };

  return (
    <div className="weekly-calendar-container">
      <table className="weekly-calendar">
        <thead>
          <tr>
            <th className="employee-col">Employee</th>
            {dateRange.map(date => (
              <th key={getDateString(date)}>
                <div>{getDayName(date)}</div>
                <div className="date-number">{getDateString(date)}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id}>
              <td className="employee-col">
                <div 
                  className={`employee-name ${selectedEmployee && selectedEmployee.id === employee.id ? 'selected' : ''}`}
                  onClick={() => { /* Handled in parent */ }}
                  data-employee-code={employee.employeeCode}
                >
                  {employee.name}
                </div>
              </td>
              {dateRange.map(date => {
                const isPeriod = isPeriodDay(employee, date);
                const periodDayNum = getPeriodDayNumber(employee, date);
                const isHovered = hoveredDate && 
                  date.getDate() === hoveredDate.getDate() &&
                  date.getMonth() === hoveredDate.getMonth() &&
                  date.getFullYear() === hoveredDate.getFullYear();
                
                return (
                  <td 
                    key={`${employee.id}-${getDateString(date)}`}
                    className={`day-cell ${isPeriod ? `period-${periodDayNum}` : ''} ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => onDateHover(date)}
                    onMouseLeave={onDateLeave}
                  >
                    <div className="blood-drop" aria-hidden="true"></div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyCalendar;