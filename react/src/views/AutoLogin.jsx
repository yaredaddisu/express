
import axiosClient from "../axiosClient";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStateContext } from "../contexts/contextprovider";

export default function AutoLogin() {
    const { setUser, setToken } = useStateContext();
    const location = useLocation();
    const emailRef = useRef();
    const passwordRef = useRef();
    const [loginError, setLoginError] = useState(null);

    const query = new URLSearchParams(location.search);
    const chat_id = decodeURIComponent(query.get('chat_id')) || '';
    const email = decodeURIComponent(query.get('email')) || '';

    const handleLogin = async (payload) => {
        try {
            const { data } = await axiosClient.post("/loginAuto", payload);
            setUser(data.user);
            setToken(data.token);
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
        if (email && chat_id) {
            handleLogin({ email, chat_id });
        }
    }, [email, chat_id]);

    const handleManualLogin = async (ev) => {
        ev.preventDefault();
        const payload = {
            email: emailRef.current.value,
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
            <div className="form">
                <h1 className="title">Login To Your Account</h1>
                <form onSubmit={handleManualLogin}>
                    <input ref={emailRef} type="email" placeholder="Email" defaultValue={email} />
                    <input ref={passwordRef} type="password" placeholder="Password" />
                    <button className="btn btn-block">Login</button>
                    {loginError && <p className="error-message">{loginError}</p>}
                    <p className="message">
                        Not Registered? <Link to="/register">Create a new account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
