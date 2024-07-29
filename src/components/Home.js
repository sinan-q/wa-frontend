import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useLogout from '../hooks/useLogout'
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Home = () => {
    const navigate = useNavigate();
    const logout = useLogout();
    const [status, setStatus] = useState('')
    const [message, setMessage] = useState('')
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
        try {
            const response = await axiosPrivate.post('/wa/send',JSON.stringify({ message }), {
                withCredentials: true,
            });
            // getStatus()
            console.log(message)
        } catch (err) {
            console.error(err);      
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
        <section>
            {status === 0 && <div className="flexGrow">
                <button onClick={startWA}>Connect Whatsapp</button>
            </div>}
            {status === 2 && <div className="flexGrow">
                <textarea
                    type="textarea"
                    id="username"
                    autoComplete="off"
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    required>
                </textarea>
                <button onClick={sendWA}>Sent Message</button>
                <button onClick={stopWA}>Stop</button>
            </div>}
            {status}
            <div className="flexGrow">
                <button onClick={signOut}>Sign Out</button>
            </div>
        </section>
    )
}

export default Home
