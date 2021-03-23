const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail')
const expressJwt = require('express-jwt')
const _ = require('lodash')
const { OAuth2Client } = require('google-auth-library')
const fetch = require('node-fetch')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const register = (req, res) => {
	const { name, email, password } = req.body

	User.findOne({ email }).exec((err, user) => {
		if (user) {
			return res.status(400).json({
				error: 'Email is already taken'
			})
		}

		const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' })

		const emailInfo = {
			from: process.env.EMAIL_FROM,
			to: email,
			subject: `Account activation link`,
			html: `
				<h1>Please use the following link to activate your account</h1>
				<p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>
				<hr/>
				<p>This email may contain sensitive information</p>
				<p>${process.env.CLIENT_URL}</p>
			`
		}

		sgMail
			.send(emailInfo)
			.then((s) => {
				return res.json({
					message: `Email has been sent to ${email}. Follow the instructions to activate your account.`
				})
			})
			.catch((error) => {
				return res.json({
					message: error.message
				})
			})
	})
}

const accountActivation = (req, res) => {
	const { token } = req.body

	if (token) {
		jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(error, decoded) {
			if (error) {
				return res.status(401).json({
					error: 'Expired link. Sign up again.'
				})
			}

			const { name, email, password } = jwt.decode(token)

			const user = new User({ name, email, password })

			user.save((error, user) => {
				if (error) {
					return res.status(401).json({
						error: 'Error saving user in database. Try to sign up again.'
					})
				}
				return res.json({
					message: 'Sign up successful!'
				})
			})
		})
	} else {
		return res.json({
			message: 'Something went wrong. Try again.'
		})
	}
}

const login = (req, res) => {
	const { email, password } = req.body

	User.findOne({ email }).exec((error, user) => {
		if (error || !user) {
			return res.status(400).json({
				error: 'User with that email does not exist. Please sign up.'
			})
		}

		if (!user.authenticate(password)) {
			return res.status(400).json({
				error: 'Email or password do not match'
			})
		}

		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
		const { _id, name, email, role } = user

		return res.json({
			token,
			user: { _id, name, email, role }
		})
	})
}

const requireUserInfo = expressJwt({ secret: process.env.JWT_SECRET, algorithms: [ 'HS256' ] })

const adminMiddleware = (req, res, next) => {
	User.findById({ _id: req.user._id }).exec((error, user) => {
		if (error || !user) {
			return res.status(400).json({
				error: 'User not found'
			})
		}

		if (user.role !== 'admin') {
			return res.status(400).json({
				error: 'Admin resource. Access denied.'
			})
		}

		req.profile = user
		next()
	})
}

const forgotPassword = (req, res) => {
	const { email } = req.body

	User.findOne({ email }, (error, user) => {
		if (error || !user) {
			return res.status(400).json({
				error: 'User with that email does not exist'
			})
		}
		const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' })

		const emailInfo = {
			from: process.env.EMAIL_FROM,
			to: email,
			subject: `Password reset link`,
			html: `
					<h1>Please use the following link to reset your password</h1>
					<p>${process.env.CLIENT_URL}/authentication/password/reset/${token}</p>
					<hr/>
					<p>This email may contain sensitive information</p>
					<p>${process.env.CLIENT_URL}</p>
				`
		}

		return user.updateOne({ resetPasswordLink: token }, (error, success) => {
			if (error) {
				return res.status(400).json({
					error: 'Database connection error on user password forgot request'
				})
			} else {
				sgMail
					.send(emailInfo)
					.then((s) => {
						return res.json({
							message: `Email has been sent to ${email}. Follow the instructions to activate your account.`
						})
					})
					.catch((error) => {
						return res.json({
							message: error.message
						})
					})
			}
		})
	})
}

const resetPassword = (req, res) => {
	const { resetPasswordLink, newPassword } = req.body

	if (resetPasswordLink) {
		jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(error, decoded) {
			if (error) {
				return res.status(400).json({
					error: 'Expired link. Try again.'
				})
			}

			User.findOne({ resetPasswordLink }, (error, user) => {
				if (error || !user) {
					return res.status(400).json({
						error: 'Something went wrong. Try later.'
					})
				}

				const updatedFields = {
					password: newPassword,
					resetPasswordLink: ''
				}

				user = _.extend(user, updatedFields)

				user.save((error, result) => {
					if (error) {
						return res.status(400).json({
							error: 'Error resetting user password'
						})
					}
					res.json({
						message: 'Success! You can now login with your new password.'
					})
				})
			})
		})
	}
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const googleLogin = (req, res) => {
	const { idToken } = req.body

	client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then((response) => {
		const { email_verified, name, email } = response.payload
		if (email_verified) {
			User.findOne({ email }).exec((error, user) => {
				if (user) {
					const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
					const { _id, email, name, role } = user
					return res.json({
						token,
						user: { _id, email, name, role }
					})
				} else {
					let password = email + process.env.JWT_SECRET
					user = new User({ name, email, password })
					user.save((error, data) => {
						if (error) {
							return res.status(400).json({
								error: 'User signup failed with google'
							})
						}
						const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
						const { _id, email, name, role } = data
						return res.json({
							token,
							user: { _id, email, name, role }
						})
					})
				}
			})
		} else {
			return res.status(400).json({
				error: 'Google login failed. Try again'
			})
		}
	})
}

const facebookLogin = (req, res) => {
	const { userID, accessToken } = req.body

	const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`

	return fetch(url, {
		method: 'GET'
	})
		.then((response) => response.json())
		.then((response) => {
			const { email, name } = response
			User.findOne({ email }).exec((error, user) => {
				if (user) {
					const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
					const { _id, email, name, role } = user
					return res.json({
						token,
						user: { _id, email, name, role }
					})
				} else {
					let password = email + process.env.JWT_SECRET
					user = new User({ name, email, password })
					user.save((error, data) => {
						if (error) {
							return res.status(400).json({
								error: 'User signup failed with facebook'
							})
						}
						const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
						const { _id, email, name, role } = data
						return res.json({
							token,
							user: { _id, email, name, role }
						})
					})
				}
			})
		})
		.catch((error) => {
			res.json({
				error: 'Facebook login failed. Try later'
			})
		})
}

module.exports = {
	register,
	accountActivation,
	login,
	requireUserInfo,
	adminMiddleware,
	forgotPassword,
	resetPassword,
	googleLogin,
	facebookLogin
}
