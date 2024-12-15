'use'

import styles from './updateProfile.module.css'

export default function updateProfile(){

    


    return (
        <div className={styles.profileSettingsPage}>
    		<div className={styles.header}>
    		</div>
    		<div className={styles.profileSettings}>Profile Settings</div>
    		<img className={styles.profileimageIcon} alt="" src="profileImage.png"/>
    		
    		<div className={styles.profileData}>
      			<div className={styles.username}>Username: </div>
      			<div className={styles.newPassword}>New Password:</div>
      			<div className={styles.reEnterNewPasswordContainer}>
        				<p className={styles.reEnter}>Re-Enter</p>
        				<p className={styles.reEnter}>New Password:</p>
      			</div>
      			<div className={styles.email}>Email:</div>
      			<input className={styles.usernameBox}>
      			</input>
      			<input className={styles.newPasswordBox}>
      			</input>
      			<input className={styles.emailBox}>
      			</input>
      			<input className={styles.reEnterNewPasswordBox}>
      			</input>
      			<input className={styles.firstName}>
      			</input>
      			<input className={styles.lastName}>
      			</input>
      			<div className={styles.firstName1}>First Name:</div>
      			<div className={styles.lastName1}>Last Name:</div>
      			<input className={styles.password}>
      			</input>
      			<div className={styles.password1}>Password:</div>
      			<button className={styles.submitchangesIcon}>SubmitChanges</button>
      			
    		</div>
    		<div className={styles.profileImage}>Profile Image</div>
    		<div className={styles.searchAMagic}>Search a Magic card to use it’s art as your Profile Image</div>
    		<input className={styles.searchrect}>
    		</input>
    		{/* <div className={styles.search}>Search</div> */}
  	</div>
    )
}