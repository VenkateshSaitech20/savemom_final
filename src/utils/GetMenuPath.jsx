// GetMenuPath.js
'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import { useParams, useRouter } from 'next/navigation';
import { responseData } from './message';
import { signOut } from 'next-auth/react';
import { getLocalizedUrl } from './i18n';

const GetMenuPath = () => {
    const [loading, setLoading] = useState();
    const [currentPath, setCurrentPath] = useState('');
    const router = useRouter();
    const { lang: locale } = useParams();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname.split('/').slice(2).join('/');
            setCurrentPath(`/${pathname}`);
        }
    }, []);

    const fetchMenuPaths = async () => {
        try {
            const response = await apiClient.post('/api/menu/get-menu-path');
            if (response.data.result === true) {
                const menus = response.data.message;
                const paths = menus.map(menu => menu.path);
                const doesPathExistInUrl = paths.includes(currentPath);
                if (!doesPathExistInUrl) {
                    router.push(getLocalizedUrl('/dashboards', locale));
                }
            } else if (response.data.result === false) {
                if (response.data.message.roleError?.name === responseData.tokenExpired ||
                    response.data.message.invalidToken === responseData.invalidToken) {
                    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                    sessionStorage.removeItem("token");
                }
            }
        } catch (error) {
            console.error('Error fetching menu paths:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentPath) {
            fetchMenuPaths();
        }
    }, [currentPath]);

    return { loading };
};

export default GetMenuPath;
