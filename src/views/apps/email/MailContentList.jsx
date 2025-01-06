import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';
import classnames from 'classnames';
import PerfectScrollbar from 'react-perfect-scrollbar';
import styles from './styles.module.css';
import PropTypes from 'prop-types';
import TextFieldStyled from '@/@core/components/mui/TextField';
import { useCallback, useEffect, useState } from 'react';
import { pageList, responseData } from '@/utils/message';
import { MenuItem } from '@mui/material';
import TablePaginationComponent from '@/components/TablePaginationComponent';
import { signOut } from 'next-auth/react';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { isToday } from '@/utils/helper';

const ScrollWrapper = ({ children, isBelowLgScreen }) => {
    return isBelowLgScreen ? (
        <div className='bs-full overflow-y-auto overflow-x-hidden relative'>{children}</div>
    ) : (
        <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
    );
};

const MailContentList = props => {
    const { isInitialMount, isBelowSmScreen, isBelowLgScreen, reload, searchTerm, setDrawerOpen, setCurrentEmail, mailComposedStatus } = props;
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(Number(pageList[0].value));
    const [totalPages, setTotalPages] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [emails, setEmails] = useState([]);

    const getEmails = useCallback(async (searchText) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post("/api/email/get-emails", {
                searchText,
                page: currentPage,
                pageSize
            });
            if (response.data.result === true) {
                setEmails(response.data.message);
                setTotalPages(response.data.totalPages);
            } else if (response.data.result === false) {
                if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                    sessionStorage.removeItem("token");
                }
            }
        } catch (error) {
            console.error("Error fetching emails:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    const stripHTML = (html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    const handleEmailClick = email => {
        setDrawerOpen(true);
        setCurrentEmail(email);
    }

    useEffect(() => {
        if (searchTerm.length > 2 || searchTerm.length === 0) {
            getEmails(searchTerm);
        }
    }, [getEmails, searchTerm]);

    useEffect(() => {
        if (mailComposedStatus === true) {
            getEmails('');
        }
    }, [getEmails, mailComposedStatus]);

    if (isInitialMount) {
        return (
            <div className='flex items-center justify-center gap-2 grow is-full'>
                <CircularProgress />
                <Typography>Loading...</Typography>
            </div>
        );
    }

    if (emails.length === 0) {
        return (
            <div className='relative flex justify-center gap-2 grow is-full bg-backgroundPaper'>
                {isLoading ? <div className='relative overflow-hidden grow is-full mt-4'><Loader /></div> : <Typography className='m-3'>No emails found!</Typography>}
                {reload && (
                    <Backdrop open={reload} className='absolute text-white z-10 bg-textDisabled'>
                        <CircularProgress color='inherit' />
                    </Backdrop>
                )}
            </div>
        );
    }

    return (
        <div className='relative overflow-hidden grow is-full'>
            {
                isLoading ?
                    <div className="mt-4"><Loader /></div> :
                    (
                        <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
                            <div className='flex flex-col'>
                                {emails && emails.map(email => (
                                    <div
                                        key={email.id}
                                        className={classnames('p-4 cursor-pointer', styles.emailList, { 'bg-actionHover': email.isRead })}
                                        onClick={() => handleEmailClick(email)}
                                    >
                                        <div className='flex items-center justify-between gap-2'>
                                            <div className='flex items-center gap-2 overflow-hidden'>
                                                <div className='flex gap-4 justify-between items-center overflow-hidden'>
                                                    <Typography variant='h6' className='whitespace-nowrap'>
                                                        {email.to.includes(',') ? `${email.to.split(',')[0]}...` : email.to}
                                                    </Typography>
                                                    <Typography variant='body2' noWrap>
                                                        {stripHTML(email.message)}
                                                    </Typography>
                                                </div>
                                            </div>
                                            {!isBelowSmScreen && (
                                                <div
                                                    className={classnames('flex items-center gap-2', styles.emailInfo, {
                                                        [styles.show]: isBelowLgScreen
                                                    })}
                                                >
                                                    <Typography variant='body2' color='text.disabled' className='whitespace-nowrap'>
                                                        {isToday(new Date(email.createdAt))
                                                            ? new Intl.DateTimeFormat('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            }).format(new Date(email.createdAt))
                                                            : new Intl.DateTimeFormat('en-GB', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: '2-digit'
                                                            }).format(new Date(email.createdAt))}
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-2 border-bs gap-4'>
                                <TextFieldStyled
                                    select
                                    value={pageSize}
                                    onChange={e => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                    variant='filled'
                                    className='page-drop-size'
                                >
                                    {pageList?.map(item => (
                                        <MenuItem key={item.value} value={item.value}>{item.value}</MenuItem>
                                    ))}
                                </TextFieldStyled>
                                <TablePaginationComponent
                                    paginationType="not-table"
                                    table={emails}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            </div>
                        </ScrollWrapper>
                    )
            }
            {reload && (
                <Backdrop open={reload} className='absolute text-white z-10 bg-textDisabled'>
                    <CircularProgress color='inherit' />
                </Backdrop>
            )}
        </div>
    );
};

MailContentList.propTypes = {
    isInitialMount: PropTypes.bool,
    isBelowLgScreen: PropTypes.bool,
    isBelowSmScreen: PropTypes.bool,
    reload: PropTypes.bool,
    searchTerm: PropTypes.string,
    setDrawerOpen: PropTypes.any,
    setCurrentEmail: PropTypes.func,
    mailComposedStatus: PropTypes.bool
};

export default MailContentList;
