'use client'

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import classnames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { filterEmails } from '@/redux-store/slices/email';
import SidebarLeft from './SidebarLeft';
import MailContent from './MailContent';
import { useSettings } from '@core/hooks/useSettings';
import { commonLayoutClasses } from '@layouts/utils/layoutClasses';
import SubUserPermission from '@/utils/SubUserPermission';

const EmailWrapper = ({ folder, label }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [backdropOpen, setBackdropOpen] = useState(false);
    const isInitialMount = useRef(true);
    const { settings } = useSettings();
    const emailStore = useSelector(state => state.emailReducer);
    const dispatch = useDispatch();
    const isBelowLgScreen = useMediaQuery(theme => theme.breakpoints.down('lg'));
    const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'));
    const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));
    const uniqueLabels = [...new Set(emailStore.emails.flatMap(email => email.labels))]
    const [mailComposedStatus, setMailComposedStatus] = useState(false);
    const { emailPermission } = SubUserPermission();

    const handleBackdropClick = () => {
        setSidebarOpen(false)
        setBackdropOpen(false)
    }

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
        }
    }, [])

    useEffect(() => {
        dispatch(filterEmails({ emails: emailStore.emails, folder, label, uniqueLabels }))
    }, [emailStore.emails, folder, label])

    useEffect(() => {
        if (backdropOpen && !sidebarOpen) {
            setBackdropOpen(false)
        }
    }, [sidebarOpen])

    useEffect(() => {
        if (backdropOpen && !isBelowMdScreen) {
            setBackdropOpen(false)
        }
        if (sidebarOpen && !isBelowMdScreen) {
            setSidebarOpen(false)
        }
    }, [isBelowMdScreen])

    return (
        <div
            className={classnames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
                border: settings.skin === 'bordered',
                'shadow-md': settings.skin !== 'bordered'
            })}
            style={{ height: '80vh' }}
        >
            <SidebarLeft
                store={emailStore}
                isBelowLgScreen={isBelowLgScreen}
                isBelowMdScreen={isBelowMdScreen}
                isBelowSmScreen={isBelowSmScreen}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                folder={folder}
                uniqueLabels={uniqueLabels}
                label={label || ''}
                setMailComposedStatus={setMailComposedStatus}
                emailPermission={emailPermission}
            />
            <Backdrop open={backdropOpen} onClick={handleBackdropClick} className='absolute z-10' />
            <MailContent
                store={emailStore}
                dispatch={dispatch}
                folder={folder}
                label={label}
                uniqueLabels={uniqueLabels}
                isInitialMount={isInitialMount.current}
                setSidebarOpen={setSidebarOpen}
                isBelowLgScreen={isBelowLgScreen}
                isBelowMdScreen={isBelowMdScreen}
                isBelowSmScreen={isBelowSmScreen}
                setBackdropOpen={setBackdropOpen}
                mailComposedStatus={mailComposedStatus}
                emailPermission={emailPermission}
            />
        </div>
    )
}

export default EmailWrapper
