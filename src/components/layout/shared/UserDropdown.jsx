'use client'
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { signOut } from 'next-auth/react';
import CustomAvatar from '@core/components/mui/Avatar';
import { useSettings } from '@core/hooks/useSettings';
import { getLocalizedUrl } from '@/utils/i18n';
import apiClient from '@/utils/apiClient';
import GetMenuPath from '@/utils/GetMenuPath';

const BadgeContentSpan = styled('span')({
    width: 8,
    height: 8,
    borderRadius: '50%',
    cursor: 'pointer',
    backgroundColor: 'var(--mui-palette-success-main)',
    boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
    const [open, setOpen] = useState(false);
    const [userProfile, setUserProfile] = useState();
    const anchorRef = useRef(null);
    const router = useRouter();
    const { settings } = useSettings();
    const { lang: locale } = useParams();
    const { doesPathExist } = GetMenuPath();

    const handleDropdownOpen = () => {
        !open ? setOpen(true) : setOpen(false)
    }
    const handleDropdownClose = (event, url) => {
        if (url) {
            router.push(getLocalizedUrl(url, locale))
        }
        if (anchorRef.current && anchorRef.current.contains(event?.target)) {
            return
        }
        setOpen(false)
    }
    const handleUserLogout = async () => {
        try {
            await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL })
            sessionStorage.removeItem("token");
        } catch (error) {
            console.error(error);
        }
    }
    const getUserProfile = async () => {
        const response = await apiClient.get(`/api/profile`);
        if (response.data.result === true) {
            if (response.data.message) {
                const data = response.data.message;
                setUserProfile(data);
            }
        }
    };
    useEffect(() => {
        getUserProfile();
    }, []);
    return (
        <>
            <Badge
                ref={anchorRef}
                overlap='circular'
                badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                className='mis-2.5'
            >
                {/* <CustomAvatar
                    ref={anchorRef}
                    alt={session?.user?.name || ''}
                    src={session?.user?.image || ''}
                    onClick={handleDropdownOpen}
                    className='cursor-pointer'
                /> */}
                <CustomAvatar
                    ref={anchorRef}
                    alt={userProfile?.name || ''}
                    src={userProfile?.image || ''}
                    onClick={handleDropdownOpen}
                    className='cursor-pointer'
                />
            </Badge>
            <Popper
                open={open}
                transition
                disablePortal
                placement='bottom-end'
                anchorEl={anchorRef.current}
                className='min-is-[240px] !mbs-4 z-[1]'
            >
                {({ TransitionProps, placement }) => (
                    <Fade
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
                        }}
                    >
                        <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
                            <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                                <MenuList>
                                    <div className='flex items-center plb-2 pli-5 gap-2' tabIndex={-1}>
                                        <CustomAvatar size={40} alt={userProfile?.name || ''} src={userProfile?.image || ''} />
                                        <div className='flex items-start flex-col'>
                                            <Typography variant='h6'>{userProfile?.name || ''}</Typography>
                                            <Typography variant='body2' color='text.disabled'>
                                                {userProfile?.email || ''}
                                            </Typography>
                                        </div>
                                    </div>
                                    <Divider className='mlb-1' />
                                    <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/pages/user-profile')}>
                                        <i className='bx-user' />
                                        <Typography color='text.primary'>My Profile</Typography>
                                    </MenuItem>
                                    {/* <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/pages/account-settings')}>
                    <i className='bx-cog' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem> */}
                                    {/* <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/pages/pricing')}>
                    <i className='bx-dollar' />
                    <Typography color='text.primary'>Pricing</Typography>
                  </MenuItem> */}
                                    {/* <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/pages/faq')}>
                    <i className='bx-help-circle' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem> */}
                                    <Divider className='mlb-1' />
                                    <MenuItem className='gap-3' onClick={handleUserLogout}>
                                        <i className='bx-power-off' />
                                        <Typography color='text.primary'>Logout</Typography>
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </>
    )
}

export default UserDropdown
