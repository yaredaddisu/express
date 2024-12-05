import axiosClient from "../axiosClient";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/contextprovider";

export default function AutoLogin() {
    const { setUser, setToken } = useStateContext();
    const location = useLocation();
    const navigate = useNavigate();  // Import and use navigate
    const emailRef = useRef();
    const passwordRef = useRef();
    const [loginError, setLoginError] = useState(null);

    const query = new URLSearchParams(location.search);
    const chat_id = decodeURIComponent(query.get('chat_id')) || '';

    const handleLogin = async (payload) => {
        try {
            const { data } = await axiosClient.post("/tech_login", payload);
            localStorage.setItem('token', data.token);

            setUser(data.user);
            setToken(data.token);
            navigate('/');  // Use navigate here to redirect
        } catch (err) {
            const response = err.response;
            if (response && response.status === 422) {
                console.log(response.data.errors);
            } else {
                setLoginError('Auto login failed. Please manually enter your password.');
                console.error('An error occurred:', err);
            }
        }
    };

    useEffect(() => {
        if (chat_id) {
            handleLogin({ chat_id });
        }
    }, [chat_id]);

    const handleManualLogin = async (ev) => {
        ev.preventDefault();
        const payload = {
            password: passwordRef.current.value,
        };
        try {
            const { data } = await axiosClient.post("/login", payload);
            setUser(data.user);
            setToken(data.token);
           
        } catch (err) {
            const response = err.response;
            if (response && response.status === 422) {
                console.log(response.data.errors);
            } else {
                setLoginError('Manual login failed. Please check your credentials and try again.');
                console.error('An error occurred:', err);
            }
        }
    };

    return (
        <div className="login-signup-form animated fadeinDown">
            {/* Uncomment this form if you want to enable manual login
            <div className="form">
                <h1 className="title">Login To Your Account</h1>
                <form onSubmit={handleManualLogin}>
                    <input ref={emailRef} type="email" placeholder="Email" />
                    <input ref={passwordRef} type="password" placeholder="Password" />
                    <button className="btn btn-block">Login</button>
                    {loginError && <p className="error-message">{loginError}</p>}
                    <p className="message">
                        Not Registered? <Link to="/register">Create a new account</Link>
                    </p>
                </form>
            </div> */}
        </div>
    );
}
