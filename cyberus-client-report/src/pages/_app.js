/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/_app.js
import '../styles/assets/css/main.css'; // ? move your CSS import here

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}


