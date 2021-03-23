import React, { useState, useEffect } from 'react'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { toast } from 'react-toastify'
import BluePrint from '../components/BluePrint'

const initialState = {
  name: '',
  token: '',
  newPassword: '',
  buttonText: 'Reset password',
}

const ResetPasswordPage = ({ match }) => {
  const [userInfo, setUserInfo] = useState(initialState)

  useEffect(() => {
    const token = match.params.token
    const { name } = jwt.decode(token)
    if (token) {
      setUserInfo({ ...userInfo, name, token })
    }
  }, [])

  const { name, token, newPassword, buttonText } = userInfo

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, newPassword: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setUserInfo({ ...userInfo, buttonText: 'Submitting' })
    axios({
      method: 'PUT',
      url: `${process.env.REACT_APP_API}/reset-password`,
      data: { newPassword, resetPasswordLink: token },
    })
      .then((resp) => {
        console.log('reset password successful!', resp)
        toast.success(resp.data.message)
        setUserInfo({ ...userInfo, buttonText: 'Done' })
      })
      .catch((err) => {
        console.log('reset password error', err.response.data)
        toast.error(err.response.data.error)
        setUserInfo({ ...userInfo, buttonText: 'Reset password' })
      })
  }

  const resetPasswordForm = (e) => (
    <form>
      <div className='form-group'>
        <label className='text-muted'>Email</label>
        <input
          onChange={handleChange}
          value={newPassword}
          type='password'
          className='form-control'
          placeholder='Enter new password'
          requried
        />
      </div>

      <div>
        <button onClick={handleSubmit} className='btn btn-primary btn-raised'>
          {buttonText}
        </button>
      </div>
    </form>
  )

  return (
    <BluePrint>
      <div className='col-md-6 offset-md-3'>
        <h1 className='p-5 text-center'>
          Hey {name}! <br /> Enter your new password
        </h1>
        {resetPasswordForm()}
      </div>
    </BluePrint>
  )
}

export default ResetPasswordPage
