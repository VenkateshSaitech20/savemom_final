'use client'
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import classnames from 'classnames';
import { rankItem } from '@tanstack/match-sorter-utils';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getFacetedRowModel, getFacetedUniqueValues, getFacetedMinMaxValues, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';
import TextFieldStyled from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';
import { getLocalizedUrl } from '@/utils/i18n';
import tableStyles from '@core/styles/table.module.css';
import Loader from '@/components/loader';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { pageList, responseData } from '@/utils/message';
import apiClient from '@/utils/apiClient';
import { signOut } from 'next-auth/react';
import AddTemplate from './AddTemplate';
import PropTypes from 'prop-types';
import { CardContent } from '@mui/material';

const Icon = styled('i')({})

const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
        itemRank
    })
    return itemRank.passed
};

const columnHelper = createColumnHelper()

const TemplateTable = ({ voiceCallPermission }) => {
    const [addTemplateOpen, setAddTemplateOpen] = useState(false)
    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    const [searchText, setSearchText] = useState('');
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(Number(pageList[0].value));
    const [totalPages, setTotalPages] = useState();

    const handleDelete = async userId => {
        setIdToDelete(userId);
        setOpen(true);
    };

    const handleViewProfile = (id) => {
        const url = getLocalizedUrl(`/apps/voice-call/template/${id}`, locale)
        router.push(url);
    };

    const { lang: locale } = useParams()

    const getTemplates = useCallback(async (searchText) => {
        setIsLoading(true);
        const response = await apiClient.post("/api/voice-call/template/get-templates", {
            searchText,
            page: currentPage,
            pageSize
        });
        if (response.data.result === true) {
            setData(response.data.message);
            setFilteredData(response.data.message)
            setTotalPages(response.data.totalPages);
            setIsLoading(false);
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    const handleTemplateAdded = async () => {
        await getTemplates(searchText);
    };

    useEffect(() => {
        getTemplates(searchText);
    }, [getTemplates]);

    const handleConfirmation = async (confirmed) => {
        setIsLoading(true);
        if (confirmed) {
            const response = await apiClient.put('/api/voice-call/template', { id: idToDelete });
            if (response.data.result === true) {
                await getTemplates(searchText);
                setOpen(false);
            } else if (response.data.result === false) {
                if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                    sessionStorage.removeItem("token");
                }
            }
        };
        setIsLoading(false);
        setIdToDelete(null);
    };
    const columns = useMemo(() => {
        const baseColumns = [
            columnHelper.accessor('category', {
                header: 'Category',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Icon />
                        <Typography className='capitalize' color='text.primary'>
                            {row.original.category}
                        </Typography>
                    </div>
                )
            }),
            columnHelper.accessor('message', {
                header: 'Message',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Icon />
                        <Typography className='capitalize truncate w-[450px]' color='text.primary' >
                            {row.original.message}
                        </Typography>
                    </div>
                )
            }),
            columnHelper.accessor('isActive', {
                header: 'Status',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Icon />
                        <Typography className='capitalize truncate w-[300px]' color='text.primary' >
                            {row.original.isActive === "Y" ? "Active" : "In Active"}
                        </Typography>
                    </div>
                )
            }),
        ];
        baseColumns.push(
            columnHelper.accessor('action', {
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center'>
                        {((voiceCallPermission?.deletePermission === "Y")) && (
                            <IconButton onClick={() => handleDelete(row.original.id)}>
                                <i className='bx-trash text-textSecondary text-[22px]' />
                            </IconButton>
                        )}
                        {((voiceCallPermission?.readPermission === "Y")) && (
                            <IconButton onClick={() => handleViewProfile(row.original.id)} >
                                <i className='bx-show text-textSecondary text-[22px]' />
                            </IconButton>
                        )}
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

    const handleSearchTextChange = (e) => {
        setGlobalFilter(e.target.value);
        setSearchText(e.target.value);
    };
    const handleVoiceCallTemplateSearch = () => {
        getTemplates(searchText);
    };
    return (
        <>
            <Card>
                <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
                    <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
                        <TextFieldStyled
                            value={globalFilter ?? ''}
                            onChange={handleSearchTextChange}
                            placeholder='Search Templates'
                            className='max-sm:is-full min-is-[220px]'
                            InputLabelProps={{ shrink: true }}
                            variant='filled'
                        />
                        <Button variant='tonal' color='primary' onClick={handleVoiceCallTemplateSearch}>
                            {isLoading ? <Loader type="btnLoader" /> : 'Search'}
                        </Button>
                    </div>
                    <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
                        {((voiceCallPermission?.writePermission === "Y")) && (
                            <Button
                                variant='contained'
                                startIcon={<i className='bx-plus' />}
                                onClick={() => setAddTemplateOpen(!addTemplateOpen)}
                                className='max-sm:is-full'
                            >
                                Add Template
                            </Button>
                        )}
                        <TextFieldStyled
                            select
                            value={pageSize}
                            onChange={e => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className='page-drop-size'
                            InputLabelProps={{ shrink: true }}
                            variant='filled'
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
                                {isLoading ?
                                    <tr>
                                        <td colSpan={table.getVisibleFlatColumns().length ?? 0} className='text-center'>
                                            <Loader />
                                        </td>
                                    </tr>
                                    :
                                    table.getRowModel()
                                        .rows.slice(0, pageSize)
                                        .map(row => {
                                            return (
                                                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                                    {row.getVisibleCells().map(cell => (
                                                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                                    ))}
                                                </tr>
                                            )
                                        })
                                }
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
                <ConfirmationDialog open={open} setOpen={setOpen} type='delete-template' onConfirm={handleConfirmation} />
            </Card>
            <AddTemplate
                open={addTemplateOpen}
                handleClose={() => setAddTemplateOpen(!addTemplateOpen)}
                handleTemplateAdded={handleTemplateAdded}
                voiceCallPermission={voiceCallPermission}
            />
        </>
    )
}

TemplateTable.propTypes = {
    voiceCallPermission: PropTypes.any
}

export default TemplateTable
