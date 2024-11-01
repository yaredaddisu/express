import axios from "axios";
import { useRef,useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axiosClient";
import { useStateContext } from "../contexts/contextprovider";
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function login(){
    const location = useLocation();
    const emailRef = useRef();
    const passwordRef = useRef();


    const {setUser, setToken} = useStateContext();

    const Submit =  (ev) =>{
        ev.preventDefault();
        const payload = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        }
        axiosClient.post("/login",payload).then(({data})=>{
             localStorage.setItem('token',  data.token);
            // localStorage.setItem('user', response.data.user);
            console.log(data)
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user data in localStorage
            // console.log(data.token);
            setUser(data);
            setToken(data.token);
    }).catch(err => {
        const response = err.response;
        if(response && response.status === 422){
            console.log(response.data.errors);
        }
    });
    }

    return(
        <div className="login-signup-form animated fadeinDown">
            <div className="form">
                <h1 className="title">
                    Login To Your Account
                </h1>
                <form onSubmit={Submit}>
                <input ref={emailRef} type="email" placeholder="Email" />
                    <input ref={passwordRef} type="password" placeholder="Password" />
                    <button className="btn btn-block">Login</button>
                   
                </form>
            </div>
        </div>
    )
}