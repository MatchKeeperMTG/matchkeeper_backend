'use client'
import React from 'react';
import MatchKeeperLogoImage from '../res/v24_88.png';

export default function LoginPage() {
  return (
    <div style={styles.pageContainer}>
      {/* Background Gradient */}
      <div style={styles.backgroundGradient}></div>

      {/* Logo */}
      <img 
        src={MatchKeeperLogoImage} 
        alt="Match Keeper Logo" 
        style={styles.logo} 
      />

      {/* Sign In Heading */}
      <div style={styles.signInText}>
        Sign In
      </div>

      {/* Input Fields */}
      <div style={styles.inputBox}></div>
      <div style={styles.inputBox}></div>

      {/* Register Text */}
      <div style={styles.registerText}>
        Not a user? Register Now
      </div>

      {/* Login Button */}
      <div style={styles.loginButton}>
        <div style={styles.loginText}>Log In</div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    position: 'relative',
    width: '100%',
    height: '1024px',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(200, 230, 197, 1), rgba(14, 0, 141, 1))',
  },
  logo: {
    position: 'absolute',
    top: '147px',
    left: '239px',
    width: '961px',
    height: '145px',
    objectFit: 'cover',
  },
  signInText: {
    position: 'absolute',
    top: '316px',
    left: '471px',
    width: '459px',
    height: '113px',
    fontSize: '50px',
    color: 'rgba(210, 242, 207, 1)',
    fontFamily: 'Ubuntu, sans-serif',
    textAlign: 'center',
  },
  inputBox: {
    position: 'absolute',
    width: '478px',
    height: '75px',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(0, 0, 0, 1)',
    borderRadius: '10px',
    left: '461px',
    top: '400px', // Adjusted for second input dynamically
  },
  registerText: {
    position: 'absolute',
    top: '766px',
    left: '567px',
    width: '266px',
    height: '43px',
    fontSize: '20px',
    color: 'rgba(200, 230, 197, 1)',
    fontFamily: 'Ubuntu, sans-serif',
    textAlign: 'center',
  },
  loginButton: {
    position: 'absolute',
    width: '181px',
    height: '50px',
    backgroundColor: 'rgba(77, 137, 72, 1)',
    borderRadius: '10px',
    left: '610px',
    top: '692px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 1)',
    fontFamily: 'Ubuntu, sans-serif',
    textAlign: 'center',
  },
};

