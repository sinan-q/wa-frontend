import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useLogout from '../hooks/useLogout'
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Validate from "./helpers/Validate";
import toast from "react-simple-toasts";

const Home = () => {
    const navigate = useNavigate();
    const logout = useLogout();
    const [status, setStatus] = useState('')
    const [message, setMessage] = useState('')
    const [number, setNumber] = useState("")

    const axiosPrivate = useAxiosPrivate();

    const signOut = async () => {
        await logout();
        navigate('/login');
    }
    const getStatus = async () => {
        try {
            const response = await axiosPrivate.get('/wa/status', {
                withCredentials: true,
            });
            setStatus(response.data.message)
        } catch (err) {
                console.error(err);
                //navigate('/login', { state: { from: location }, replace: true });
            
        }
    }
    const stopWA = async () => {
        try {
            const response = await axiosPrivate.post('/wa/logout', {
                withCredentials: true,
            });
            getStatus()
        } catch (err) {
            console.error(err);      
        }
    }
    const sendWA = async () => {
        const validate = Validate(number, "phonenumber");
        if(!validate.result) toast(validate.error)
        else try {
            const response = await axiosPrivate.post('/wa/send',JSON.stringify({ message, phoneNumber: "91"+number }), {
                withCredentials: true,
            });
            toast(response.data.message)
        } catch (err) {
            toast(err.response?.data?.message || err.message)
  
        }
    }

    const startWA = async () => {
        try {
            const response = await axiosPrivate.post('/wa/start', {
                withCredentials: true,
            });
            getStatus()
        } catch (err) {
            console.error(err);      
        }
    }
    useEffect(() => {
        
        getStatus()
        const interval = setInterval(() => {
            getStatus()
        }, 30000);

        return ()=> clearInterval(interval)
    }, [])

    
        

    return (
        <div>
            {status === 0 && <div className="flexGrow">
                <button onClick={startWA}>Connect Whatsapp</button>
            </div>}
            {status === 2 && <div className="flexGrow">
                <input
                    type="number"
                    id="phoneNumber"
                    autoComplete="off"
                    onChange={(e) => setNumber(e.target.value)}
                    value={number}
                    required />
                <textarea
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    required>
                </textarea>
                <button onClick={sendWA}>Sent</button>
                <button onClick={stopWA}>Stop</button>
            </div>}
            <div className="flexGrow">
                <button onClick={signOut}>Sign Out</button>
            </div>
        </div>
    )
}

export default Home
