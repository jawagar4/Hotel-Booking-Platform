import axios from 'axios';
import { createContext, use, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';


axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const currency = import.meta.env.VITE_DEFAULT_CURRENCY || '$';
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();

    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchCities, setSearchCities] = useState([]);

    const fetchUser = async () => {
        try { 
            const {data} = await axios.get('api/user',{headers: {
                Authorization: `Bearer ${await getToken()}`
            }});
            if (data.success) {
            setIsOwner(data.role === 'hotelOwner');
            setSearchCities(data.recentSearchCities)
            }else{
                //Retry Fetching user data
                setTimeout(() => {
                    fetchUser();
                }, 5000);
            }
        } catch (error) {
            toast.error( error.message );
        }
    };

    // Fetch user data when the component mounts
   useEffect(() => {
        if (user) {
            fetchUser();
        }
   }, [user]);
    const value = {
        // Add any context values or functions here
        currency,
        navigate,
        user,
        getToken,
        isOwner,
        setIsOwner,
        axios,
        showHotelReg,
        setShowHotelReg,
        searchCities,
        setSearchCities
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}
    

export const useAppContext = () => useContext(AppContext);