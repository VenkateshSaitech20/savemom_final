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

const SMSContentList = props => {
    const { isInitialMount, isBelowSmScreen, isBelowLgScreen, reload, searchTerm, setDrawerOpen, setCurrentSMS, smsDeliveredStatus } = props;
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(Number(pageList[0].value));
    const [totalPages, setTotalPages] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [smsData, setSmsData] = useState([]);

    const getSMS = useCallback(async (searchText) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post("/api/sms/get-sms", {
                searchText,
                page: currentPage,
                pageSize
            });
            if (response.data.result === true) {
                setSmsData(response.data.message);
                setTotalPages(response.data.totalPages);
            } else if (response.data.result === false) {
                if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                    sessionStorage.removeItem("token");
                }
            }
        } catch (error) {
            console.error("Error fetching sms:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    const stripHTML = (html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    const handleSMSClick = sms => {
        setDrawerOpen(true);
        setCurrentSMS(sms);
    }

    useEffect(() => {
        if (searchTerm.length > 2 || searchTerm.length === 0) {
            getSMS(searchTerm);
        }
    }, [getSMS, searchTerm]);

    useEffect(() => {
        if (smsDeliveredStatus === true) {
            getSMS('');
        }
    }, [getSMS, smsDeliveredStatus]);

    if (isInitialMount) {
        return (
            <div className='flex items-center justify-center gap-2 grow is-full'>
                <CircularProgress />
                <Typography>Loading...</Typography>
            </div>
        );
    }

    if (smsData.length === 0) {
        return (
            <div className='relative flex justify-center gap-2 grow is-full bg-backgroundPaper'>
                {isLoading ? <div className='relative overflow-hidden grow is-full mt-4'><Loader /></div> : <Typography className='m-3'>No sms found!</Typography>}
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
                                {smsData && smsData.map(sms => (
                                    <div
                                        key={sms.id}
                                        className={classnames('p-4 cursor-pointer', styles.emailList, { 'bg-actionHover': sms.isRead })}
                                        onClick={() => handleSMSClick(sms)}
                                    >
                                        <div className='flex items-center justify-between gap-2'>
                                            <div className='flex items-center gap-2 overflow-hidden'>
                                                <div className='flex gap-4 justify-between items-center overflow-hidden'>
                                                    <Typography variant='h6' className='whitespace-nowrap'>
                                                        {sms.to.includes(',') ? `${sms.to.split(',')[0]}...` : sms.to}
                                                    </Typography>
                                                    <Typography variant='body2' noWrap>
                                                        {stripHTML(sms.message)}
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
                                                        {isToday(new Date(sms.createdAt))
                                                            ? new Intl.DateTimeFormat('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            }).format(new Date(sms.createdAt))
                                                            : new Intl.DateTimeFormat('en-GB', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: '2-digit'
                                                            }).format(new Date(sms.createdAt))}
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
                                    table={smsData}
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

SMSContentList.propTypes = {
    isInitialMount: PropTypes.bool,
    isBelowLgScreen: PropTypes.bool,
    isBelowSmScreen: PropTypes.bool,
    reload: PropTypes.bool,
    searchTerm: PropTypes.string,
    setDrawerOpen: PropTypes.any,
    setCurrentSMS: PropTypes.func,
    smsDeliveredStatus: PropTypes.bool
};

export default SMSContentList;
