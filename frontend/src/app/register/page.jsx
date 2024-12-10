'use client'

import styles from './registerStyles.module.css'

export default function registerPage() {

    return(
    <div className={styles.registerPage}>
        <div className={styles.background}></div>
        <div className={styles.headerIcon} />
        <div className={styles.registerAccount}>Register Account</div>
        <div className={styles.fieldframe}>
    <div className={styles.emailBox}></div>
    <div className={styles.email}>Email:</div>
    <div className={styles.usernameBox}></div>
    <div className={styles.username}>Username:</div>
    <div className={styles.passwordBox}></div>
    <div className={styles.password}>Password:</div>
    <div className={styles.reEnterPasswordBox}></div>
    <div className={styles.reEnterPassword}>Re-enter Password:</div>
    <div className={styles.makeAMatchkeeperContainer}>
      <span className={styles.makeAMatchkeeperContainer1}>
        <p className={styles.makeA}>Make A </p>
        <p className={styles.makeA}>Matchkeeper Account</p>
      </span>
    </div>
    <div className={styles.registerbox}></div>
    <div className={styles.register}>Register</div>
    <div className={styles.fieldframeChild}></div>
    <div className={styles.back}>Back</div>
    <div className={styles.firstNameBox}></div>
    <div className={styles.firsName}>First Name:</div>
    <div className={styles.lastNameBox}  />
    <div className={styles.lastName}>Last Name:</div>
        </div>
    </div>

    )
}