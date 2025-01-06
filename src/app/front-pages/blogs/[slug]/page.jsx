
import BlogDetail from '@views/front-pages/blogs/BlogDetail'
import { getServerMode } from '@core/utils/serverHelpers'

const BlogDetailPage = () => {
    const mode = getServerMode()
    return <BlogDetail mode={mode} />
}

export default BlogDetailPage
