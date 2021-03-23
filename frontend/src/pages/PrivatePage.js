import React, { useState, useEffect } from 'react'
import {
  isAuthenticated,
  getCookie,
  signOut,
  updateUserInfo,
} from '../components/HelperFunctions'
import axios from 'axios'
import { toast } from 'react-toastify'
import BluePrint from '../components/BluePrint'

const initialState = {
  role: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  buttonText: 'Submit',
}

const PrivatePage = ({ history }) => {
  const [userInfo, setUserInfo] = useState(initialState)

  const { role, name, email, password, confirmPassword, buttonText } = userInfo

  const handleChange = (name) => (e) => {
    setUserInfo({ ...userInfo, [name]: e.target.value })
  }

  useEffect(() => {
    loadProfileInfo()
  }, [])

  const token = getCookie('token')

  const loadProfileInfo = () => {
    axios({
      method: 'GET',
      url: `${process.env.REACT_APP_API}/user/${isAuthenticated()._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => {
        console.log('private profile update', resp)
        const { role, name, email } = resp.data
        setUserInfo({ ...userInfo, role, name, email })
      })
      .catch((error) => {
        if (error.response.status === 401) {
          signOut(() => {
            history.push('/')
          })
        }
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword)
      return toast.error('Passwords do not match')
    setUserInfo({ ...userInfo, buttonText: 'Submitting' })
    axios({
      method: 'PUT',
      url: `${process.env.REACT_APP_API}/user/update`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { name, password },
    })
      .then((resp) => {
        console.log('Profile update successful!', resp)
        updateUserInfo(resp, () => {
          setUserInfo({ ...userInfo, buttonText: 'Submitted' })
          toast.success('Profile updated successfully!')
        })
      })
      .catch((err) => {
        console.log('Profile update error', err.response.data.error)
        setUserInfo({ ...userInfo, buttonText: 'Submit' })
        toast.error(err.response.data.error)
      })
  }

  const updateForm = (e) => (
    <form>
      <div className='form-group'>
        <label className='text-muted'>Role</label>
        <input
          defaultValue={role}
          type='text'
          className='form-control'
          disabled
        />
      </div>

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
          defaultValue={email}
          type='email'
          className='form-control'
          disabled
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
        <button onClick={handleSubmit} className='btn btn-primary btn-raised'>
          {buttonText}
        </button>
      </div>
    </form>
  )

  return (
    <BluePrint>
      <div className='col-md-6 offset-md-3'>
        <h1 className='p-5 text-center'>Profile Page</h1>
        <h4 className='lead text-center'>Update Profile</h4>
        {updateForm()}
      </div>
    </BluePrint>
  )
}

export default PrivatePage
