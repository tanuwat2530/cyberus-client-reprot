/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';

import { format, eachDayOfInterval } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';


import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ClientReport(){

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const router = useRouter();
const [shortcodeList, setShortcodeList] = useState([]);
const [dataReport, setDataReport] = useState(null);

//const [err,setError]= useState([]);


useEffect(() => {
    const username = localStorage.getItem('user'); // replace with your key
    const session = localStorage.getItem('session'); // replace with your key
    const partner_id = localStorage.getItem('partner_id'); // replace with your key
    
    const reqData = {
      username,
      session,
    };

//CHECK SESSION LOGIN API
    fetch(`${apiUrl}/api/client-report-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqData),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch user list');
      }
      return response.json();
    })
    .then((data) =>  {
      if (data["code"] === '0') {
          router.push('/login')
      }
    })
    .catch((err) => console.log(err.message));

//GET SHORTCODE
  console.log("partner_id : ", partner_id)
    fetch(`${apiUrl}/api/client-report-shortcode-client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    body: JSON.stringify({client_partner_id: partner_id}),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user list');
        }
        return response.json();
      })
      .then((data) =>  
       // console.log("SHORTCODE : ",JSON.stringify(data)))
        setShortcodeList( data ))
      .catch((err) => console.log(err.message));


  }, [apiUrl,router]);

const [startDate, setStartDate] = useState(new Date(), 'dd/MM/yyyy');
const [endDate, setEndDate] = useState(new Date(), 'dd/MM/yyyy');

//DO NOT MOVE ORDER
// Merge and group totals and shortcodes by date
const mergeChartData = (reportData) => {
  const allDates = Array.from(new Set(
    Object.values(reportData).flat().map(item => item.Date)
  ));

  return allDates.map(date => {
    const getSumAndShorts = (key) => {
      if (reportData[key] != null) {
        const filtered = reportData[key].filter(item => item.Date === date);
        return {
          total: filtered.reduce((sum, item) => sum + item.Total, 0),
          shorts: filtered.map(item => item.ShortCode).filter(code => code !== "0").join(', ')
        };
      } else {
        return {
          total: 0,
          shorts: ""
        };
      }
    };

    const aisCancel = getSumAndShorts("ais-cancel");
    const aisRegister = getSumAndShorts("ais-register");
    const dtacCancel = getSumAndShorts("dtac-cancel");
    const dtacRegister = getSumAndShorts("dtac-register");
    const tmvhCancel = getSumAndShorts("tmvh-cancel");
    const tmvhRegister = getSumAndShorts("tmvh-register");

    return {
      date,
      aisCancelTotal: aisCancel.total,
      aisRegisterTotal: aisRegister.total,
      dtacCancelTotal: dtacCancel.total,
      dtacRegisterTotal: dtacRegister.total,
      tmvhCancelTotal: tmvhCancel.total,
      tmvhRegisterTotal: tmvhRegister.total,
      aisCancelShort: aisCancel.shorts,
      aisRegisterShort: aisRegister.shorts,
      dtacCancelShort: dtacCancel.shorts,
      dtacRegisterShort: dtacRegister.shorts,
      tmvhCancelShort: tmvhCancel.shorts,
      tmvhRegisterShort: tmvhRegister.shorts
    };
  });
};

const lineChartReport = dataReport ? mergeChartData(dataReport) : [];

//DO NOT MOVE ORDER


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: 10 }}>
      <p><strong>Date:</strong> {label}</p>
      <p>AIS Cancel: {item.aisCancelTotal} ({item.aisCancelShort || 'N/A'})</p>
      <p>AIS Register: {item.aisRegisterTotal} ({item.aisRegisterShort || 'N/A'})</p>
      <p>DTAC Cancel: {item.dtacCancelTotal} ({item.dtacCancelShort || 'N/A'})</p>
      <p>DTAC Register: {item.dtacRegisterTotal} ({item.dtacRegisterShort || 'N/A'})</p>
      <p>TMVH Cancel: {item.tmvhCancelTotal} ({item.tmvhCancelShort || 'N/A'})</p>
      <p>TMVH Register: {item.tmvhRegisterTotal} ({item.tmvhRegisterShort || 'N/A'})</p>
    </div>
  );
};

// const pieData = [
//   {name:'CAPTION-1',value:11,count: 11},
//   {name:'CAPTION-2',value:22,count: 22},
//   {name:'CAPTION-3',value:33,count: 33},
//   {name:'CAPTION-4',value:44,count: 44}, 
//   {name:'CAPTION-5',value:55,count: 55},
// ]

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];

const handleSearch = () => {

  if (startDate && endDate) {

    const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
    const formattedDates = datesInRange.map(date => format(date, 'dd/MM/yyyy'));
    
    const searchTimeArray = [];
    formattedDates.forEach(dateStr =>     
     searchTimeArray.push(convertDateRangeToTimestamps(dateStr))
    )
    
const payload = {
  "list-shortcode": shortcodeList,     // e.g. from another state
  "date-time": searchTimeArray      // your new date range
};

console.log("PAYLOAD : ",(JSON.stringify(payload)))
    fetch(`${apiUrl}/api/client-report-line-chart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Report Data:', JSON.stringify(data)); // optional debug log
         setDataReport(data); // <- set it into state
      })
      .catch((err) => console.log(err.message));
      
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
    //const nextDayDate = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
    //const endTimestampMs = nextDayDate.getTime() - 1; // Timestamp in milliseconds

    // If you need it in seconds (Unix timestamp is typically in seconds)
    const startTimestampSeconds = Math.floor(startTimestampMs / 1000);
    //const endTimestampSeconds = Math.floor(endTimestampMs / 1000); // Note: this rounds down

    // To get exactly 23:59:59 timestamp in seconds, you can set it directly:
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999); // Set to 999ms for safety
    const endTimestampSecondsPrecise = Math.floor(endDate.getTime() / 1000);

    return {
       
       // startMs: startTimestampMs,
       // endMs: endTimestampMs,
        dateString:dateString,
        startSeconds: startTimestampSeconds.toString(),
        endSeconds: endTimestampSecondsPrecise.toString() // Use this for 23:59:59 in seconds
    };
}




  return (

    <div style={{ padding: '40px'  }}>
      {/* Date Picker UI */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div>
          <label><strong>Start Date:</strong></label><br />
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" />
        </div>
        <div>
          <label><strong>End Date:</strong></label><br />
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" />
        </div>
        <div>
          <button onClick={handleSearch} style={{ padding: '8px 16px', marginTop: '20px' }}>
            Search
          </button>
        </div>
      </div>

     {dataReport && (
  <div style={{ width: '90%', height: 400, marginBottom: '40px' }}>
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={lineChartReport} margin={{ top: 60, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="aisCancelTotal" stroke="#025c09" name="AIS Cancel" />
        <Line type="monotone" dataKey="aisRegisterTotal" stroke="#0ead1b" name="AIS Register" />
        <Line type="monotone" dataKey="dtacCancelTotal" stroke="#091875" name="DTAC Cancel" />
        <Line type="monotone" dataKey="dtacRegisterTotal" stroke="#0541f5" name="DTAC Register" />
        <Line type="monotone" dataKey="tmvhCancelTotal" stroke="#a36070" name="TMVH Cancel" />
        <Line type="monotone" dataKey="tmvhRegisterTotal" stroke="#e6093d" name="TMVH Register" />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}
 
      {/* Pie Chart */}
      {/* <div style={{ width: '100%', height: 300 }}>
        <center><h4>Overall Register</h4></center>
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
         <center><h4>Overall Cancel</h4></center>
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

      </div> */}
      
    </div>
  );
}