import React from "react";
import styles from "./registerStyles.module.css";

 const registerbutton = (onClick,children) =>{
    return (<button onClick={onClick}>{children}</button>);
 }

export default registerbutton;