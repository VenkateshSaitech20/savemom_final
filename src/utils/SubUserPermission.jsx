'use client';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/utils/apiClient';

const SubUserPermission = () => {
    const [dashboardPermission, setDashboardPermission] = useState({});
    const [manageRolesPermission, setManageRolesPermission] = useState({});
    const [manageUsersPermission, setManageUsersPermission] = useState({});
    const [accountSettingsPermission, setAccountSettingsPermission] = useState({});
    const [systemSettingsPermission, setSystemSettingsPermission] = useState({});
    const [websiteSettingsPermission, setWebsiteSettingsPermission] = useState({});
    const [configureSubscriptionPermission, setConfigureSubscriptionPermission] = useState({});
    const [mySubscriptionPermission, setMySubscriptionPermission] = useState({});
    const [emailPermission, setEmailPermission] = useState({});
    const [smsPermission, setSMSPermission] = useState({});
    const [voiceCallPermission, setVoiceCallPermission] = useState({});
    const [masterSettingsPermission, setMasterSettingsPermission] = useState({});
    const [categoryPermission, setCategoryPermission] = useState({});
    const [contentPermission, setContentPermission] = useState({});
    const [mailTemplateSettingsPermission, setMailTemplateSettingsPermission] = useState({});
    const [pushNotificationPermission, setPushNotificationPermission] = useState({});
    const [whatsAppPermission, setWhatsAppPermission] = useState({});

    const fetchPermissions = useCallback(async () => {
        const response = await apiClient.post('/api/menu/permissions', {});
        if (response.data.result === true) {
            const permissions = response.data.message;
            setDashboardPermission(permissions["dashboard"] || {});
            setManageRolesPermission(permissions["manage-roles"] || {});
            setManageUsersPermission(permissions["manage-users"] || {});
            setAccountSettingsPermission(permissions["account-settings"] || {});
            setSystemSettingsPermission(permissions["system-settings"] || {});
            setWebsiteSettingsPermission(permissions["website-settings"] || {});
            setConfigureSubscriptionPermission(permissions["configure-subscription"] || []);
            setMySubscriptionPermission(permissions["my-subscription"] || []);
            setEmailPermission(permissions["email"] || []);
            setSMSPermission(permissions["sms"] || []);
            setVoiceCallPermission(permissions["voice-call"] || []);
            setMasterSettingsPermission(permissions["location"] || {});
            setCategoryPermission(permissions["category"] || {});
            setContentPermission(permissions["content"] || {});
            setMailTemplateSettingsPermission(permissions["mail-template-settings"] || {});
            setPushNotificationPermission(permissions["push-notification"] || {});
            setWhatsAppPermission(permissions["whatsapp"] || {});
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);
    return { dashboardPermission, manageRolesPermission, manageUsersPermission, accountSettingsPermission, systemSettingsPermission, websiteSettingsPermission, configureSubscriptionPermission, mySubscriptionPermission, emailPermission, smsPermission, voiceCallPermission, masterSettingsPermission, categoryPermission, contentPermission, mailTemplateSettingsPermission, pushNotificationPermission, whatsAppPermission };
};

export default SubUserPermission;
