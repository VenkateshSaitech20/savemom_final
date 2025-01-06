
import BlogPageWrapper from '@views/front-pages/blogs'
import { getServerMode } from '@core/utils/serverHelpers'

const BlogPage = () => {
    const mode = getServerMode()
    return <BlogPageWrapper mode={mode} />
}

export default BlogPage
