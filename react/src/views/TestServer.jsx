
 import {  useEffect, useState} from "react";
 
export default function TestServer(){

    const [data, setData] = useState(null);

    useEffect(() => {
      fetch('http://localhost:5050/api/data')
        .then((response) => response.json())
        .then((data) => setData(data));
    }, []);
    
    return(
        <div>
        <h1>Message from Backend:</h1>
        {data ? <p>{data.message}</p> : <p>Loading...</p>}
      </div>
    )
}