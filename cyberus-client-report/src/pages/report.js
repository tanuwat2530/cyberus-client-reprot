import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, eachDayOfInterval } from 'date-fns';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const registerData = [
  { name: '01/06/2025', value: 400, count: 400 },
  { name: '02/06/2025', value: 300, count: 300 },
  { name: '03/06/2025', value: 200, count: 200 },
  { name: '04/06/2025', value: 278, count: 278 },
  { name: '05/06/2025', value: 189, count: 189 },
];

const cancelData = [
  { name: '01/06/2025', value: 150, count: 150 },
  { name: '02/06/2025', value: 100, count: 100 },
  { name: '03/06/2025', value: 80, count: 80 },
  { name: '04/06/2025', value: 90, count: 90 },
  { name: '05/06/2025', value: 50, count: 50 },
];

// Merge data by month so each object contains both register and cancel values
const mergedData = registerData.map((item) => {
  const cancelItem = cancelData.find(cd => cd.name === item.name) || {};
  return {
    name: item.name,
    registerValue: item.value,
    registerCount: item.count,
    cancelValue: cancelItem.value || 0,
    cancelCount: cancelItem.count || 0,
  };
});

const pieData = [
  {name:'454111',value:11,count: 11},
  {name:'454222',value:22,count: 22},
  {name:'454333',value:33,count: 33},
  {name:'454444',value:44,count: 44}, 
  {name:'454555',value:55,count: 55},
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];

const CombinedChart = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

const handleSearch = () => {
  if (startDate && endDate) {
    const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });

    const formattedDates = datesInRange.map(date => format(date, 'dd/MM/yyyy'));
    
    console.log("Selected Dates:");
    formattedDates.forEach(dateStr => console.log(convertDateRangeToTimestamps(dateStr)))
  } else {
    alert("Please select both start and end dates.");
  }
};

function convertDateRangeToTimestamps(dateString) {
    // Ensure dateString is in a format parseable by new Date()
    // For "DD/MM/YYYY", it's safer to parse manually or rearrange to "MM/DD/YYYY"
    // or use a library. Let's assume MM/DD/YYYY for direct parsing.
    // If your input is strictly DD/MM/YYYY, you'll need to reformat it.
    // Example: "01/06/2025" -> "06/01/2025" for JavaScript's default parsing.

    // Let's assume the input dateString is 'DD/MM/YYYY' and parse it correctly.
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // Month is 0-indexed in JS Date
    const year = parseInt(parts[2], 10);

    // Start of the day (00:00:00.000)
    // Month is (month - 1) because JavaScript months are 0-indexed (January is 0)
    const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const startTimestampMs = startDate.getTime(); // Timestamp in milliseconds

    // End of the day (23:59:59.999)
    // Option 1: Go to the next day at 00:00:00 and subtract 1 millisecond
    const nextDayDate = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
    const endTimestampMs = nextDayDate.getTime() - 1; // Timestamp in milliseconds

    // If you need it in seconds (Unix timestamp is typically in seconds)
    const startTimestampSeconds = Math.floor(startTimestampMs / 1000);
    const endTimestampSeconds = Math.floor(endTimestampMs / 1000); // Note: this rounds down

    // To get exactly 23:59:59 timestamp in seconds, you can set it directly:
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999); // Set to 999ms for safety
    const endTimestampSecondsPrecise = Math.floor(endDate.getTime() / 1000);

    return {
       
       // startMs: startTimestampMs,
       // endMs: endTimestampMs,
        startSeconds: startTimestampSeconds,
        endSeconds: endTimestampSecondsPrecise // Use this for 23:59:59 in seconds
    };
}

  return (
    <div style={{ padding: '40px' }}>
      {/* Separate Start and End Date Pickers */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div>
          <label><strong>Start Date:</strong></label><br />
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select start date"
          />
        </div>
        <div>
          <label><strong>End Date:</strong></label><br />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select end date"
          />
        </div>
       <div>
        
    <button onClick={handleSearch} style={{
      margin:'12px',
      padding: '8px 16px',
      backgroundColor: '#0088FE',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}>
      Search
    </button>
  </div> 
        </div>
        {/* Line Chart */}
        <div style={{ width: '100%', height: 300, marginBottom: '40px' }}>
          <h3>REGISTER VS. CANCEL</h3>
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* Line for registerData */}
              <Line type="monotone" dataKey="registerValue" stroke="#8884d8" name="REGISTER" />
              {/* Line for cancelData */}
              <Line type="monotone" dataKey="cancelValue" stroke="#ff7300" name="CANCEL" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      {/* Pie Chart */}
      <div style={{ width: '100%', height: 300 }}>
        <h3>OVERALL REGISTER</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CombinedChart;
