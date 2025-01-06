'use client'
import { useParams } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Menu, SubMenu, MenuItem } from '@menu/vertical-menu';
import useVerticalNav from '@menu/hooks/useVerticalNav';
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon';
import menuItemStyles from '@core/styles/vertical/menuItemStyles';
import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import apiClient from '@/utils/apiClient';
import { responseData } from '@/utils/message';
import PropTypes from "prop-types";

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='bx-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const transformMenuData = (menus) => {
  const groupedMenu = menus?.reduce((acc, item) => {
    const { menu, subMenu, ...rest } = item;
    if (menu === subMenu) {
      acc.push({ type: 'menuItem', ...rest, menu, sequence: item.sequence });
    } else {
      const parentIndex = acc.findIndex(group => group.menu === menu);
      if (parentIndex === -1) {
        acc.push({
          type: 'subMenu',
          menu,
          items: [{ ...rest, subMenu, sequence: item.sequence }],
          sequence: item.sequence
        });
      } else {
        acc[parentIndex].items.push({ ...rest, subMenu, sequence: item.sequence });
      }
    }
    return acc;
  }, []);
  groupedMenu.sort((a, b) => a.sequence - b.sequence);
  groupedMenu.forEach(group => {
    if (group.type === 'subMenu') {
      group.items.sort((a, b) => a.sequence - b.sequence);
    }
  });
  return groupedMenu;
};

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  const [menus, setMenus] = useState([]);
  const theme = useTheme();
  const params = useParams();
  const verticalNavOptions = useVerticalNav();
  const { transitionDuration, isBreakpointReached } = verticalNavOptions;
  const { lang: locale } = params;
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar;

  const getMenus = useCallback(async () => {
    const response = await apiClient.post('/api/menu/get-sub-user-menus', {});
    if (response.data.result === true) {
      setMenus(response.data.message);
    } else if (response.data.result === false) {
      if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
        await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
        sessionStorage.removeItem("token");
      }
    }

  }, []);

  useEffect(() => {
    getMenus();
  }, [getMenus])

  const icons = {
    "User Management": "bx-check-shield",
    "Dashboard": "bx-home-smile",
    "Settings": "bx-cog",
    "Channel Management": "bx-grid-alt",
    "Reports": "bx-spreadsheet",
    "Content Management": "bx-book-content",
    "Subscription Management": "bx-money",
    "Master Data": "bx-data"
  };
  const groupedMenu = transformMenuData(menus);

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 27 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='bx-bxs-circle' /> }}
      >
        {groupedMenu.map(item => {
          if (item.type === 'menuItem') {
            return (
              <MenuItem key={item.id} href={`/${locale}${item.path.startsWith('/') ? item.path : '/' + item.path}`} icon={<i className={icons[item.menu]} />}>
                {item.menu}
              </MenuItem>
            );
          } else if (item.type === 'subMenu') {
            return (
              <SubMenu
                key={item.menu}
                label={item.menu}
                icon={<i className={icons[item.menu]} />}
              >
                {item.items.map(subItem => (
                  <MenuItem key={subItem.id} href={`/${locale}${subItem.path.startsWith('/') ? subItem.path : '/' + subItem.path}`}>
                    {subItem.subMenu}
                  </MenuItem>
                ))}
              </SubMenu>
            );
          }
          return null;
        })}
      </Menu>
    </ScrollWrapper>
  );
}

VerticalMenu.propTypes = {
  dictionary: PropTypes.any,
  scrollMenu: PropTypes.any,
};
RenderExpandIcon.propTypes = {
  open: PropTypes.any,
  transitionDuration: PropTypes.any,
};
export default VerticalMenu;
