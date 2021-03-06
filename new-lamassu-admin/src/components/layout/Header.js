import { useQuery } from '@apollo/react-hooks'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Popper from '@material-ui/core/Popper'
import { makeStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import gql from 'graphql-tag'
import React, { memo, useState } from 'react'
import { NavLink, useHistory } from 'react-router-dom'

import NotificationCenter from 'src/components/NotificationCenter'
import ActionButton from 'src/components/buttons/ActionButton'
import { H4 } from 'src/components/typography'
import AddMachine from 'src/pages/AddMachine'
import { ReactComponent as AddIconReverse } from 'src/styling/icons/button/add/white.svg'
import { ReactComponent as AddIcon } from 'src/styling/icons/button/add/zodiac.svg'
import { ReactComponent as Logo } from 'src/styling/icons/menu/logo.svg'
import { ReactComponent as NotificationIcon } from 'src/styling/icons/menu/notification.svg'

import styles from './Header.styles'

const useStyles = makeStyles(styles)

const HAS_UNREAD = gql`
  query getUnread {
    hasUnreadNotifications
  }
`

const Subheader = ({ item, classes }) => {
  const [prev, setPrev] = useState(null)

  return (
    <div className={classes.subheader}>
      <div className={classes.content}>
        <nav>
          <ul className={classes.subheaderUl}>
            {item.children.map((it, idx) => (
              <li key={idx} className={classes.subheaderLi}>
                <NavLink
                  to={{ pathname: it.route, state: { prev } }}
                  className={classes.subheaderLink}
                  activeClassName={classes.activeSubheaderLink}
                  isActive={match => {
                    if (!match) return false
                    setPrev(it.route)
                    return true
                  }}>
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

const Header = memo(({ tree }) => {
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [active, setActive] = useState()
  const { data, refetch } = useQuery(HAS_UNREAD)
  const hasUnread = data?.hasUnreadNotifications ?? false
  const history = useHistory()
  const classes = useStyles()

  const onPaired = machine => {
    setOpen(false)
    history.push('/maintenance/machine-status', { id: machine.deviceId })
  }

  // these inline styles prevent scroll bubbling: when the user reaches the bottom of the notifications list and keeps scrolling,
  // the body scrolls, stealing the focus from the notification center, preventing the admin from scrolling the notifications back up
  // on the first scroll, needing to move the mouse to recapture the focus on the notification center
  // it also disables the scrollbars caused by the notification center's background to the right of the page, but keeps the scrolling on the body enabled
  const onClickAway = () => {
    setAnchorEl(null)
    document.querySelector('#root').classList.remove('root-notifcenter-open')
    document.querySelector('body').classList.remove('body-notifcenter-open')
  }

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
    document.querySelector('#root').classList.add('root-notifcenter-open')
    document.querySelector('body').classList.add('body-notifcenter-open')
  }

  const popperOpen = Boolean(anchorEl)
  const id = popperOpen ? 'notifications-popper' : undefined
  return (
    <header className={classes.headerContainer}>
      <div className={classes.header}>
        <div className={classes.content}>
          <div
            onClick={() => {
              setActive(false)
              history.push('/dashboard')
            }}
            className={classnames(classes.logo, classes.logoLink)}>
            <Logo />
            <H4 className={classes.white}>Lamassu Admin</H4>
          </div>
          <nav className={classes.nav}>
            <ul className={classes.ul}>
              {tree.map((it, idx) => (
                <NavLink
                  key={idx}
                  to={it.route || it.children[0].route}
                  isActive={match => {
                    if (!match) return false
                    setActive(it)
                    return true
                  }}
                  className={classnames(classes.link, classes.whiteLink)}
                  activeClassName={classes.activeLink}>
                  <li className={classes.li}>
                    <span className={classes.forceSize} forcesize={it.label}>
                      {it.label}
                    </span>
                  </li>
                </NavLink>
              ))}
            </ul>
          </nav>
          <div className={classes.actionButtonsContainer}>
            <ActionButton
              color="secondary"
              Icon={AddIcon}
              InverseIcon={AddIconReverse}
              onClick={() => setOpen(true)}>
              Add machine
            </ActionButton>
            <ClickAwayListener onClickAway={onClickAway}>
              <div>
                <button
                  onClick={handleClick}
                  className={classes.notificationIcon}>
                  <NotificationIcon />
                  {hasUnread && <div className={classes.hasUnread} />}
                </button>
                <Popper
                  id={id}
                  open={popperOpen}
                  anchorEl={anchorEl}
                  className={classes.popper}
                  disablePortal={false}
                  modifiers={{
                    preventOverflow: {
                      enabled: true,
                      boundariesElement: 'viewport'
                    }
                  }}>
                  <NotificationCenter
                    close={onClickAway}
                    notifyUnread={refetch}
                  />
                </Popper>
              </div>
            </ClickAwayListener>
          </div>
        </div>
      </div>
      {active && active.children && (
        <Subheader item={active} classes={classes} />
      )}
      {open && <AddMachine close={() => setOpen(false)} onPaired={onPaired} />}
    </header>
  )
})

export default Header
