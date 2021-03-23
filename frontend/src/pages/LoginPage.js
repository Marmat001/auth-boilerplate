import React, { useState } from 'react'
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'
import { authenticate, isAuthenticated } from '../components/HelperFunctions'
import { toast } from 'react-toastify'
import BluePrint from '../components/BluePrint'
import Google from '../components/GoogleLogin'
import Facebook from '../components/FacebookLogin'

const initialState = {
  email: 'markusw880i@hotmail.com',
  password: 'abohassan',
  buttonText: 'Submit',
}

const LogInPage = ({ history }) => {
  const [userInfo, setUserInfo] = useState(initialState)
  const { email, password, buttonText } = userInfo

  const handleChange = (name) => (e) => {
    setUserInfo({ ...userInfo, [name]: e.target.value })
  }

  const informParent = (resp) => {
    authenticate(resp, () => {
      isAuthenticated() && isAuthenticated().role === 'admin'
        ? history.push('/admin')
        : history.push('/private')
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setUserInfo({ ...userInfo, buttonText: 'Submitting' })
    axios({
      method: 'POST',
      url: `${process.env.REACT_APP_API}/login`,
      data: { email, password },
    })
      .then((resp) => {
        console.log('Sign in successful!', resp)

        authenticate(resp, () => {
          setUserInfo({
            ...userInfo,
            name: '',
            email: '',
            password: '',
            buttonText: 'Submitted',
          })
          isAuthenticated() && isAuthenticated().role === 'admin'
            ? history.push('/admin')
            : history.push('/private')
        })
      })
      .catch((err) => {
        console.log('Sign in error', err.response.data)
        setUserInfo({ ...userInfo, buttonText: 'Submit' })
        toast.error(err.response.data.error)
      })
  }

  const signInForm = (e) => (
    <form>
      <div className='form-group'>
        <label className='text-muted'>Email</label>
        <input
          onChange={handleChange('email')}
          value={email}
          type='email'
          className='form-control'
        />
      </div>

      <div className='form-group'>
        <label className='text-muted'>Password</label>
        <input
          onChange={handleChange('password')}
          value={password}
          type='password'
          className='form-control'
        />
      </div>

      <div>
        <button
          onClick={handleSubmit}
          className='btn btn-primary btn-raised btn mr-3'
        >
          {buttonText}
        </button>
        <Link
          to='/authentication/forgot-password'
          className='btn btn-sm btn-outline-danger'
        >
          Forgot Password?
        </Link>
      </div>
    </form>
  )

  return (
    <BluePrint>
      <div className='col-md-6 offset-md-3'>
        {isAuthenticated() ? <Redirect to='/' /> : null}
        <h1 className='p-5 text-center'>Log In</h1>
        {signInForm()}
        <br />

        <Google informParent={informParent} />
        <Facebook informParent={informParent} />
      </div>
    </BluePrint>
  )
}

export default LogInPage
