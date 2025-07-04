import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import SHA256 from 'crypto-js/sha256';
import { v4 as uuidv4 } from 'uuid';


import '../styles/assets/css/main.css';

export default function CyberusLogin () {

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: send to server
  const uniqueId = uuidv4();
        // Combine and hash
    const combined = username + password + uniqueId;
    const session = SHA256(combined).toString();
    const formData = {
      username,
      password,
      session
    };
  
    fetch(`${apiUrl}/api/client-report-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Cannot login');
        }
        return response.json();
      })
      .then((data) => {
        // console.log("username : ",username)
        // console.log("password : ",password)
        // console.log("partner_id : ",data[0]["partner_id"])
        if (data[0]["code"] == '1'){
          alert("Welcome "+username)
          localStorage.setItem("user", username);
          localStorage.setItem("session", session);
          localStorage.setItem("partner_id", data[0]["partner_id"]);
          router.push("/report")
          
        }else{
          // Redirect if no session
          navigate('/login');
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });

  };

  return (
   <div
    className="is-preload"
    id="wrapper"
    style={{
      color: 'red',
      backgroundImage: `url('/images/bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
    }}
  >
      {/* Intro Section */}
      <div id="intro">
        <h1>CYBERUS</h1>
        <h3>Reporting Interface</h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className='label-caption'>
              USER NAME
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className='label-caption'>
              PASSWORD
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input type="submit" value="Login" />
          </div>
        </form>

        <p>
          2025 Cyberus Corporation Co., Ltd.<br />
          If you have any problem with this interface, please contact{' '}
          <a href="mailto:webmaster@cyberuscorporation.com">
            webmaster@cyberuscorporation.com
          </a>.
        </p>

        {/* <ul className="actions">
          <li>
            <a
              href="#header"
              className="button icon solid solo fa-arrow-down scrolly"
            >
              Continue
            </a>
          </li>
        </ul> */}
      </div>

      {/* Header Section */}
      <header id="header">
        <a href="index.html" className="logo">
          CYBERUS
        </a>
      </header>
    </div>
  );
};


