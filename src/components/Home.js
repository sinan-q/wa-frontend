import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useLogout from '../hooks/useLogout'
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Validate from "./helpers/Validate";
import toast from "react-simple-toasts";
import QRCode from "react-qr-code";

const Home = () => {
    const navigate = useNavigate();
    const logout = useLogout();
    const [status, setStatus] = useState('')
    const [message, setMessage] = useState('')
    const [number, setNumber] = useState("")
    const [qr, setQr] = useState('')

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
            setQr(response.data.qr)
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
            toast(response.data.message)
            setTimeout(getStatus, 2000);
        } catch (err) {
            toast(err.response.data.message)

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
            toast(response.data.message)
            setTimeout(getStatus, 2000);
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
        <div className="absolute    ">
            <div className='text-3xl text-center'>Send Message</div>

            {status === 0 && <div className="">
                <button className="mt-8 text-center w-full bg-black hover:bg-white hover:text-black border hover:border-black p-2 px-4 text-white  " onClick={startWA}>Connect Whatsapp</button>
                <button className=" mt-10 border p-2 text-center w-full hover:bg-red-400 hover:text-white " onClick={stopWA}>Stop</button>

            </div>}
            {status === 1 && qr && <div>
                <QRCode value={qr} />
                </div>}
            {status === 2 && <div className=" p-2 flex flex-col">
                <label className='mt-3'htmlFor="phoneNumber">Sender Phone Number:</label>
                <div className='border border-black'>
                    <label for='username' className=' p-2  inline mr-2'>+91</label>
                    <input
                        className='p-1 w-60'
                        type="number"
                        id="phoneNumber"
                        autoComplete="off"
                        onChange={(e) => setNumber(e.target.value)}
                        value={number}
                        required
                    />  
                </div>
                <div className="">
                    <label className='mt-3 block'  htmlFor="phoneNumber">Message:</label>
                    <textarea
                        className="p-1 h-24 border border-black w-full text-sm "
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        required>
                    </textarea>
                </div>
                <button className="text-center bg-black hover:bg-white hover:text-green-500 border hover:border-black p-2 px-4 text-white" onClick={sendWA}>Send</button>
                <button className=" mt-10 border p-2 text-center w-full hover:bg-red-400 hover:text-white " onClick={stopWA}>Stop</button>
            </div>}
            <div className="mt-1   ">
                <button className=" border p-2 m-auto text-center w-full hover:bg-red-400 hover:text-white "onClick={signOut}>Sign Out</button>
            </div>
        </div>
    )
}

export default Home
