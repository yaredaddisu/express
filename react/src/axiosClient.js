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
 