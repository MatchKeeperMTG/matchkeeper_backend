'use client'

import styles from './registerStyles.module.css'
import registerAccountButton from './registerAccountButton';

export default function registerPage() {

    function registerAccount ()  {
      //Fill in register user account here
      console.log("blarg");
    };

  function navigateToLogin(){
    //Fill in the return to login screen here
  };

    return(
    <div className={styles.registerPage}>
        <div className={styles.background}></div>
        <div className={styles.headerIcon} />
        <div className={styles.registerAccount}>Register Account</div>
        <div className={styles.fieldframe}>
    <input className={styles.emailBox}></input>
    <div className={styles.email}>Email:</div>
    <input className={styles.usernameBox}></input>
    <div className={styles.username}>Username:</div>
    <input className={styles.passwordBox}></input>
    <div className={styles.password}>Password:</div>
    <input className={styles.reEnterPasswordBox}></input>
    <div className={styles.reEnterPassword}>Re-enter Password:</div>
    <div className={styles.makeAMatchkeeperContainer}>
      <span className={styles.makeAMatchkeeperContainer1}>
        <p className={styles.makeA}>Make A </p>
        <p className={styles.makeA}>Matchkeeper Account</p>
      </span>
    </div>
    <button className={styles.registerbox} onClick={registerAccount}>Register</button>
    
    {/* <div className={styles.register}>Register</div> */}
    
    <a href='http://localhost:3000/'>
      <button className={styles.backBox}>Back</button>
    </a>
    {/* <div className={styles.back}>Back</div> */}
    <input className={styles.firstNameBox}></input>
    <div className={styles.firstName}>First Name:</div>
    <input className={styles.lastNameBox}></input>  
    <div className={styles.lastName}>Last Name:</div>
        </div>
    </div>

    )
}