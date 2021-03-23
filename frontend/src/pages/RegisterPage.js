import React, { useState } from 'react'
import { isAuthenticated } from '../components/HelperFunctions'
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import BluePrint from '../components/BluePrint'

const initialState = {
  name: 'Markus',
  email: 'markusw880i@hotmail.com',
  password: 'abohassan',
  confirmPassword: 'abohassan',
  buttonText: 'Submit',
}

const RegisterPage = () => {
  const [userInfo, setUserInfo] = useState(initialState)

  const { name, email, password, confirmPassword, buttonText } = userInfo

  const handleChange = (name) => (e) => {
    setUserInfo({ ...userInfo, [name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword)
      return toast.error('Passwords do not match')
    setUserInfo({ ...userInfo, buttonText: 'Submitting' })
    axios({
      method: 'POST',
      url: `${process.env.REACT_APP_API}/register`,
      data: { name, email, password },
    })
      .then((resp) => {
        setUserInfo({
          ...userInfo,
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          buttonText: 'Submitted',
        })
        toast.success(resp.data.message)
      })
      .catch((err) => {
        setUserInfo({ ...userInfo, buttonText: 'Submit' })
        toast.error(err.response.data.error)
      })
  }

  const signUpForm = (e) => (
    <form>
      <div className='form-group'>
        <label className='text-muted'>Name</label>
        <input
          onChange={handleChange('name')}
          value={name}
          type='text'
          className='form-control'
        />
      </div>

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

      <div className='form-group'>
        <label className='text-muted'>Confirm Password</label>
        <input
          onChange={handleChange('confirmPassword')}
          value={confirmPassword}
          type='password'
          className='form-control'
        />
      </div>

      <div>
        <button
          disabled={buttonText === 'Submitted' || buttonText === 'Submitting'}
          onClick={handleSubmit}
          className='btn btn-primary btn-raised mr-3'
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

      <Link to='/login' className='btn btn-sm btn-outline-primary mt-3'>
        Have an account? Log In
      </Link>
    </form>
  )

  return (
    <BluePrint>
      <div className='col-md-6 offset-md-3'>
        {isAuthenticated() ? <Redirect to='/' /> : null}
        <h1 className='p-5 text-center'>Register</h1>
        {signUpForm()}
      </div>
    </BluePrint>
  )
}

export default RegisterPage
