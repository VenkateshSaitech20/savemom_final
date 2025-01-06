// 'use client'
// import { redirect, usePathname } from 'next/navigation'
// import themeConfig from '@configs/themeConfig'
// import { getLocalizedUrl } from '@/utils/i18n'
// const AuthRedirect = ({ lang }) => {
//   const pathname = usePathname()
//   // ℹ️ Bring me `lang`
//   // const redirectUrl = `/${lang}/login?redirectTo=${pathname}`
//   const redirectUrl = `/`
//   // const login = `/${lang}/login`
//   const login = `/`
//   const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)
//   return redirect(pathname === login ? login : pathname === homePage ? login : redirectUrl)
// }
// export default AuthRedirect


'use client'
import { redirect, usePathname } from 'next/navigation'
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'
const AuthRedirect = ({ lang }) => {
  const pathname = usePathname()
  const redirectUrl = `/${lang}/login?redirectTo=${pathname}`
  const login = `/${lang}/login`
  const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)
  return redirect(pathname === login ? login : pathname === homePage ? login : redirectUrl)
}
export default AuthRedirect
