import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

import BluePrint from '../components/BluePrint'

const initialState = {
  email: '',
  buttonText: 'Request password reset link',
}

const ForgotPasswordPage = ({ history }) => {
  const [userInfo, setUserInfo] = useState(initialState)
  const { email, buttonText } = userInfo

  const handleChange = (name) => (e) => {
    setUserInfo({ ...userInfo, [name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setUserInfo({ ...userInfo, buttonText: 'Submitting' })
    axios({
      method: 'PUT',
      url: `${process.env.REACT_APP_API}/forgot-password`,
      data: { email },
    })
      .then((resp) => {
        toast.success(resp.data.message)
        setUserInfo({ ...userInfo, buttonText: 'Requested' })
      })
      .catch((err) => {
        toast.error(err.response.data.error)
        setUserInfo({ ...userInfo, buttonText: 'Request password reset link' })
      })
  }

  const forgotPasswordForm = (e) => (
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

      <div>
        <button   disabled={buttonText === 'Requested' || buttonText === 'Submitting'} onClick={handleSubmit} className='btn btn-primary btn-raised'>
          {buttonText}
        </button>
      </div>
    </form>
  )

  return (
    <BluePrint>
      <div className='col-md-6 offset-md-3'>
        <h1 className='p-5 text-center'>Forgot Password</h1>
        {forgotPasswordForm()}
      </div>
    </BluePrint>
  )
}

export default ForgotPasswordPage
