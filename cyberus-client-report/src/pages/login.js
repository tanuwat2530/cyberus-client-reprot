/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';

import { useRouter } from 'next/router';
import SHA256 from 'crypto-js/sha256';
import { v4 as uuidv4 } from 'uuid';


export default function CyberusLogin () {

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  

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
  
    fetch(`${apiUrl}/report-login`, {
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
        if (data[0]["code"] === '1'){
          alert("Welcome "+username)
          localStorage.setItem("user", username);
          localStorage.setItem("session", session);
          localStorage.setItem("partner_id", data[0]["partner_id"]);
          router.push("/report")
          
        }else{
          // Redirect if no session
          router.push("/login")
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });

  };

  return (
   <div className='backgroud-login'>
      {/* Intro Section */}
      <div id="intro">
        <h1>CYBERUS</h1>
        <h3>Reporting Interface</h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className='label-login'>
              USER NAME
              <input className='input-login'
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className='label-login'>
              PASSWORD
              <input  className='input-login'
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input className='button-login' type="submit" value="Login" />
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


