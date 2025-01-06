/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/dashboards',
        permanent: true,
        locale: false
      },
      {
        source: '/login',
        destination: '/en/login',
        permanent: true,
        locale: false
      },
      {
        source: '/register',
        destination: '/en/register',
        permanent: true,
        locale: false
      }
    ]
  },
  rewrites: async () => {
    return [
      {
        source: '/',
        destination: '/front-pages/landing-page',
      }
    ];
  },

}

export default nextConfig
