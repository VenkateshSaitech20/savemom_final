import { useCallback, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import BlogCard from './BlogCard';
import apiClient from '@/utils/apiClient';
import Loader from '@/components/loader';
import { Typography } from '@mui/material';
import TablePaginationComponent from '@/components/TablePaginationComponent';
import { pageList } from '@/utils/message';

const Blog = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [blogData, setBlogData] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(Number(pageList[0].value));
    const [totalPages, setTotalPages] = useState();

    const getBlogs = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/content-management/content/get-all', {
            page: currentPage,
            pageSize
        });
        if (response?.data?.result === true) {
            setIsLoading(false);
            setBlogData(response?.data?.message);
            setTotalPages(response.data.totalPages);
        }
        setIsLoading(false);
    }, [currentPage])

    useEffect(() => {
        getBlogs();
    }, [getBlogs])

    return (
        <Box component="section" className='plb-[100px] bg-backgroundDefault'>
            <Container>
                {isLoading ? <Loader /> : (
                    <Grid container spacing={4}>
                        {blogData?.length > 0 ? (
                            blogData?.map((blog) => (
                                <Grid item xs={12} sm={6} lg={4} key={blog.id}>
                                    <BlogCard
                                        imageSrc={blog.image}
                                        title={blog.title}
                                        description={blog.shortContent}
                                        postedAt={blog.updatedAt}
                                        slug={blog.slug}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography className="mb-0">No blogs found</Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
                {blogData?.length > 0 &&
                    <Grid item xs={12}>
                        <div className='flex justify-center flex-col items-center md:flex-row md:items-center p-2 gap-4'>
                            <TablePaginationComponent
                                paginationType="not-table"
                                table={blogData}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    </Grid>
                }
            </Container>
        </Box >
    )
}

export default Blog
