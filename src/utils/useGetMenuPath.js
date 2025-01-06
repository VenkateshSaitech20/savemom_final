import { useEffect } from 'react';
import GetMenuPath from './GetMenuPath';

const useGetMenuPath = () => {
    const { loading } = GetMenuPath();

    useEffect(() => {
    }, [loading]);

    return { loading };
};

export default useGetMenuPath;
