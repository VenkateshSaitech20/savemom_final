'use client'
import Navigation from './Navigation';
import NavbarContent from './NavbarContent';
import Navbar from '@layouts/components/horizontal/Navbar';
import LayoutHeader from '@layouts/components/horizontal/Header';
import useHorizontalNav from '@menu/hooks/useHorizontalNav';
import PropTypes from "prop-types";

const Header = ({ dictionary }) => {
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <>
      <LayoutHeader>
        <Navbar>
          <NavbarContent />
        </Navbar>
        {!isBreakpointReached && <Navigation dictionary={dictionary} />}
      </LayoutHeader>
      {isBreakpointReached && <Navigation dictionary={dictionary} />}
    </>
  )
}

Header.propTypes = {
  dictionary: PropTypes.any,
};
export default Header
