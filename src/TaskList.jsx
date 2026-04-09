import { useState, useEffect } from "react";

export default function useOnlineStatus() {
    const [isOnline, setIsonline] = useState(true);
    useEffect(() => {
        function handleOnline() {
            setIsonline(true);
        }

        function handleOffline() {
            setIsonline(false);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener(
                'online',
                handleOnline
            );

            window.removeEventListener(
                'offline',
                handleOffline
            );
        };
    }, []);
    return isOnline;
}