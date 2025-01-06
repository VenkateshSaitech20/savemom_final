'use client'
import { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import classnames from 'classnames';
import { rankItem } from '@tanstack/match-sorter-utils';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getFacetedRowModel, getFacetedUniqueValues, getFacetedMinMaxValues, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';
import TablePaginationComponent from '@components/TablePaginationComponent';
import tableStyles from '@core/styles/table.module.css';
import { pageList, responseData } from '@/utils/message';
import apiClient from '@/utils/apiClient';
import { signOut } from 'next-auth/react';
import Loader from '@/components/loader';
import TextFieldStyled from '@core/components/mui/TextField';
import { getDate } from '@/utils/helper';
import useGetMenuPath from '@/utils/useGetMenuPath';

const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
        itemRank
    })
    return itemRank.passed
}

const columnHelper = createColumnHelper()

const SubscriptionReport = () => {
    const [rowSelection, setRowSelection] = useState({});
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(Number(pageList[0].value));
    const [totalPages, setTotalPages] = useState();
    const { loading } = useGetMenuPath();

    const getSubscriptionHistory = useCallback(async (searchText) => {
        if (isLoading === true) { return }
        setIsLoading(true);
        const response = await apiClient.post("/api/reports/subscription-history", {
            searchText,
            page: currentPage,
            pageSize,
        });
        if (response?.data?.result === true) {
            setData(response.data.message);
            setFilteredData(response.data.message)
            setTotalPages(response.data.totalPages);
            setIsLoading(false);
        } else if (response?.data?.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        getSubscriptionHistory(searchText);
    }, [getSubscriptionHistory]);

    const handleExport = async () => {
        if (isButtonLoading === true) { return }
        try {
            setIsButtonLoading(true);
            const response = await apiClient.post('/api/reports/subscription-history/excel-report', { searchText }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'subscription_history_report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            setIsButtonLoading(false);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Name',
                cell: ({ row }) => (
                    <div className='flex items-center gap-3'>
                        <div className='flex flex-col items-start'>
                            <Typography variant='h6'>{row.original.name}</Typography>
                        </div>
                    </div>
                )
            }),
            columnHelper.accessor('email', {
                header: 'Email Id',
                cell: ({ row }) => <Typography color='text.primary'>{row.original.email}</Typography>
            }),
            columnHelper.accessor('contactNo', {
                header: 'Phone Number',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'><Typography>{row.original.contactNo}</Typography></div>
                )
            }),
            columnHelper.accessor('price', {
                header: 'Price',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'><Typography>{row.original.amount}</Typography></div>
                )
            }),
            columnHelper.accessor('packageName', {
                header: 'package Name',
                cell: ({ row }) => <Typography>{row.original.packageName}</Typography>
            }),
            columnHelper.accessor('paymentId', {
                header: 'Payment Id',
                cell: ({ row }) => <Typography>{row.original.paymentId}</Typography>
            }),
            columnHelper.accessor('paymentMethod', {
                header: 'Payment Method',
                cell: ({ row }) => <Typography>{row.original.paymentMethod}</Typography>
            }),
            columnHelper.accessor('paymentStatus', {
                header: 'Payment Status',
                cell: ({ row }) => <Typography className='capitalize'>{row.original.paymentStatus}</Typography>
            }),
            columnHelper.accessor('purchaseDate', {
                header: 'Purchase Date',
                cell: ({ row }) => <Typography>{getDate(row.original.purchaseDate)}</Typography>
            }),
            columnHelper.accessor('expirayDate', {
                header: 'Expiray Date',
                cell: ({ row }) => <Typography>{getDate(row.original.expirayDate)}</Typography>
            }),
            columnHelper.accessor('validity', {
                header: 'validity',
                cell: ({ row }) => <Typography>{row.original.packageValidity}</Typography>
            }),
            columnHelper.accessor('currency', {
                header: 'currency',
                cell: ({ row }) => <Typography>{row.original.currency}</Typography>
            })
        ],
        [data, filteredData]
    )
    const table = useReactTable({
        data: filteredData,
        columns,
        pageCount: totalPages,
        manualPagination: true,
        state: {
            rowSelection
        },
        initialState: {
            pagination: {
                pageSize: pageSize
            }
        },
        onPaginationChange: ({ pageSize, pageIndex }) => {
            setPageSize(pageSize);
            setCurrentPage(pageIndex + 1);
        },
        enableRowSelection: true,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues()
    })

    const handleSearchTextChange = (e) => {
        const text = e.target.value;
        setSearchText(text);
        setGlobalFilter(text);
    };
    const handleSubscriptionSearch = () => {
        getSubscriptionHistory(searchText);
    };

    return (
        <Card>
            <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
                <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
                    <TextFieldStyled
                        value={globalFilter ?? ''}
                        onChange={handleSearchTextChange}
                        placeholder='Search Subscription'
                        className='max-sm:is-full min-is-[220px]'
                        InputLabelProps={{ shrink: true }}
                        variant='filled'
                    />
                    <Button variant='tonal' color='primary' onClick={handleSubscriptionSearch}>
                        {isLoading ? <Loader type="btnLoader" /> : 'Search'}
                    </Button>
                </div>
                <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
                    <Button variant='tonal' color='secondary' startIcon={<i className='bx-export' />} onClick={handleExport}>
                        {isButtonLoading ? <Loader type="btnLoader" /> : 'Export'}
                    </Button>
                    <TextFieldStyled
                        select
                        className='page-drop-size'
                        value={pageSize}
                        variant='filled'
                        onChange={e => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {pageList?.map(item => (
                            <MenuItem key={item.value} value={item.value}>{item.value}</MenuItem>
                        ))}
                    </TextFieldStyled>
                </div>
            </CardContent>
            <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={classnames({
                                                    'flex items-center': header.column.getIsSorted(),
                                                    'cursor-pointer select-none': header.column.getCanSort()
                                                })}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: <i className='bx-chevron-up text-xl' />,
                                                    desc: <i className='bx-chevron-down text-xl' />
                                                }[header.column.getIsSorted()] ?? null}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    {(table.getFilteredRowModel().rows.length === 0 && !loading) ? (
                        <tbody>
                            <tr>
                                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                                    {isLoading ? <Loader /> : 'No data available'}
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={table.getVisibleFlatColumns().length ?? 0} className='text-center'>
                                        <Loader />
                                    </td>
                                </tr>
                            ) : (table
                                .getRowModel()
                                .rows.slice(0, pageSize)
                                .map(row => {
                                    return (
                                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                            ))}
                                        </tr>
                                    )
                                }))}
                        </tbody>
                    )}
                </table>
            </div>
            <TablePaginationComponent
                table={table}
                totalPages={totalPages}
                pageSize={pageSize}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </Card>
    )
}

export default SubscriptionReport
