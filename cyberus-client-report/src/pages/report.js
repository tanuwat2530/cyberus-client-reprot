import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const lineChartData = 
{
    "dtac-cancel": [
        {
            "Date": "22/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "23/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "24/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "25/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "22/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "23/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "24/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "25/06/2025",
            "ShortCode": "",
            "Total": 0
        }
    ],
    "dtac-register": [
        {
            "Date": "22/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "23/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "24/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "25/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "22/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "23/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "24/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "25/06/2025",
            "ShortCode": "",
            "Total": 0
        }
    ],
    "tmvh-cancel": [
        {
            "Date": "22/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "23/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "24/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "25/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "22/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "23/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "24/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "25/06/2025",
            "ShortCode": "",
            "Total": 0
        }
    ],
    "tmvh-register": [
        {
            "Date": "22/06/2025",
            "ShortCode": "4239111",
            "Total": 1
        },
        {
            "Date": "23/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "24/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "25/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "22/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "23/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "24/06/2025",
            "ShortCode": "",
            "Total": 0
        },
        {
            "Date": "25/06/2025",
            "ShortCode": "",
            "Total": 0
        }
    ]
}


// Merge and group totals and shortcodes by date
const mergeChartData = () => {
  const allDates = Array.from(new Set(
    Object.values(lineChartData).flat().map(item => item.Date)
  ));

  return allDates.map(date => {
    const getSumAndShorts = (key) => {
     if(lineChartData[key] != null)
     {
      const filtered = lineChartData[key].filter(item => item.Date === date);
      return {
        total: filtered.reduce((sum, item) => sum + item.Total, 0),
        shorts: filtered.map(item => item.ShortCode).filter(code => code !== "0").join(', ')
      };
    }else{
       return {
        total:0,
        shorts: ""
      };
    }
  }
    
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

const data = mergeChartData();

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

const LineChartComponent = () => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
);

export default LineChartComponent;
