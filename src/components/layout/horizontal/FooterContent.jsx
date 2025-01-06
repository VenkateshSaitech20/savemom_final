'use client'
import Link from 'next/link'
import classnames from 'classnames'
import useHorizontalNav from '@menu/hooks/useHorizontalNav'
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div
      className={classnames(horizontalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made with `}</span>
        <span>{`❤️`}</span>
        <span className='text-textSecondary'>{` by `}</span>
        <Link href='https://themeselection.com' target='_blank' className='text-primary'>
          ThemeSelection
        </Link>
      </p>
      {!isBreakpointReached && (
        <div className='flex items-center gap-4'>
          <Link href='https://themeselection.com/license' target='_blank' className='text-primary'>
            License
          </Link>
          <Link href='https://themeselection.com' target='_blank' className='text-primary'>
            More Themes
          </Link>
          <Link
            href='https://demos.themeselection.com/sneat-mui-nextjs-admin-template/documentation'
            target='_blank'
            className='text-primary'
          >
            Documentation
          </Link>
          <Link href='https://themeselection.com/support' target='_blank' className='text-primary'>
            Support
          </Link>
        </div>
      )}
    </div>
  )
}

export default FooterContent
