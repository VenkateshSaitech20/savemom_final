'use client'
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import classnames from 'classnames';
import { rankItem } from '@tanstack/match-sorter-utils';
import PropTypes from "prop-types";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table';
import { getLocalizedUrl } from '@/utils/i18n';
import tableStyles from '@core/styles/table.module.css';
import Loader from '@/components/loader';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { pageList, responseData } from '@/utils/message';
import apiClient from '@/utils/apiClient';
import { signOut } from 'next-auth/react';
import SubUserPermission from '@/utils/SubUserPermission';

const Icon = styled('i')({})

const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
        itemRank
    })
    return itemRank.passed
}

const columnHelper = createColumnHelper()

const LanguageList = () => {
    // States
    const [addUserOpen, setAddUserOpen] = useState(false)
    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userRoles, setUserRoles] = useState([]);
    const [open, setOpen] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(Number(pageList[0].value));
    const [totalPages, setTotalPages] = useState();

    const getProfiles = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post("/api/sub-user/get-by-users-id", {
            page: currentPage,
            pageSize
        });
        const language = [
            {
                id: '1',
                name: 'English'
            },
            {
                id: '1',
                name: 'French'
            }
        ]
        if (response.data.result === true) {
            setData(response.data.message);
            // setFilteredData(response.data.message)
            setFilteredData(language)
            setTotalPages(response.data.totalPages);
            setIsLoading(false);
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
        }
    }, [currentPage, pageSize]);

    const handleConfirmation = async (confirmed) => {
        setIsLoading(true);
        if (confirmed) {
            const response = await apiClient.post('/api/sub-user/delete', { userId: userIdToDelete });
            if (response.data.result === true) {
                await getProfiles();
                setOpen(false);
            } else if (response.data.result === false) {
                if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                    sessionStorage.removeItem("token");
                }
            }
        };
        setIsLoading(false);
        setUserIdToDelete(null);
    };

    const getUserRole = async () => {
        const response = await apiClient.post('/api/user-role/get-roles-by-user-id', {})
        if (response.data.result === true) {
            setUserRoles(response.data.message)
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
        }
    };

    useEffect(() => {
        getUserRole();
    }, [])

    useEffect(() => {
        getProfiles()
    }, [getProfiles]);

    const { lang: locale } = useParams()

    const columns = useMemo(() => {

        const baseColumns = [
            columnHelper.accessor('name', {
                header: 'Language',
                cell: ({ row }) => (
                    <div className='flex items-center gap-4'>
                        <div className='flex flex-col'>
                            <Typography variant='h6'>{row.original.name}</Typography>
                        </div>
                    </div>
                )
            })
        ];

        baseColumns.push(
            columnHelper.accessor('action', {
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center'>
                        <Button size="small" variant='contained' type='submit'>
                            Manage
                        </Button>
                    </div>
                ),
                enableSorting: false
            })
        );

        return baseColumns;
    }, [data, filteredData]);

    const table = useReactTable({
        data: filteredData,
        columns,
        pageCount: totalPages,
        manualPagination: true,
        state: {
            rowSelection,
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

    return (
        <Card>
            <CardHeader title='Languages' className='pbe-4' />
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
                    {table.getFilteredRowModel().rows.length === 0 ? (
                        <tbody>
                            <tr>
                                <td colSpan={table.getVisibleFlatColumns().length ?? 0} className='text-center'>
                                    {isLoading ? <Loader /> : 'No data available'}
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {table.getRowModel()
                                .rows.slice(0, pageSize)
                                .map(row => {
                                    return (
                                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                            ))}
                                        </tr>
                                    )
                                })}
                        </tbody>
                    )}
                </table>
            </div>
            <ConfirmationDialog open={open} setOpen={setOpen} type='delete-user' onConfirm={handleConfirmation} />
        </Card>
    )
}

export default LanguageList
