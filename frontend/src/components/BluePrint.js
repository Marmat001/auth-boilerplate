import React, { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { isAuthenticated, signOut } from './HelperFunctions'
import { Link, withRouter } from 'react-router-dom'

const BluePrint = ({ children, match }) => {
  const active = window.location.pathname

  const navigation = () => (
    <ul className='nav nav-tabs bg-primary d-flex justify-content-between p-2'>
      <li className='nav-item'>
        <Link
          to='/'
          className={`nav-link pt-2 pb-2 ${active === '/' && 'active'}`}
        >
          Home
        </Link>
      </li>

      {!isAuthenticated() && (
        <Fragment>
          <li className='nav-item'>
            <Link
              to='/login'
              className={`nav-link pt-2 pb-2 ${
                active === '/login' && 'active'
              }`}
            >
              Log In
            </Link>
          </li>

          <li className='nav-item'>
            <Link
              to='/register'
              className={`nav-link pt-2 pb-2 ${
                active === '/register' && 'active'
              }`}
            >
              Register
            </Link>
          </li>
        </Fragment>
      )}

      {isAuthenticated() && isAuthenticated().role === 'admin' && (
        <li className='nav-item'>
          <Link
            to='/admin'
            className={`nav-link pt-2 pb-2 ${active === '/admin' && 'active'}`}
          >
            {isAuthenticated().name}
          </Link>
        </li>
      )}

      {isAuthenticated() && isAuthenticated().role === 'customer' && (
        <li className='nav-item'>
          <Link
            to='/private'
            className={`nav-link pt-2 pb-2 ${
              active === '/user/dashboard' && 'active'
            }`}
          >
            {isAuthenticated().name}
          </Link>
        </li>
      )}

      {isAuthenticated() && (
        <Route
          render={({ history }) => (
            <li className='nav-item'>
              <Link
                to='/'
                className='nav-link pt-2 pb-2'
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  signOut(() => {
                    history.push('/')
                  })
                }}
              >
                Log Out
              </Link>
            </li>
          )}
        />
      )}
    </ul>
  )

  return (
    <Fragment>
      {navigation()}
      <div className='container'>{children}</div>
    </Fragment>
  )
}

export default withRouter(BluePrint)
