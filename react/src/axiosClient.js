import axios from "axios";

const axiosClient = axios.create({
   //baseURL: "https://api.lomistock.com/api",
//    baseURL: "https://api.express.com.lomistock.com/api",
//baseURL: "http://127.0.0.1:3000/api",
baseURL: "https://expressnode.vercel.app/api",

});


axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        try {
            const { response } = error;
            if (response.status === 401) {
                localStorage.removeItem("ACCESS_TOKEN");
            }
        } catch (err) {
            console.error(err);
        }
        throw error;
    }
);

export default axiosClient;
// const accountSid = 'AC5ed978b8db2e28af325a73ef8766ab7b';
// const authToken = '[AuthToken]';
// const client = require('twilio')(accountSid, authToken);

// client.messages
//     .create({
//         body: 'yared addisu',
//         from: '+16196580085',
//         to: '+2510923423589'
//     })
//     .then(message => console.log(message.sid))
//     .done();