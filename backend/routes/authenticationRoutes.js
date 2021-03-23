const express = require('express')
const router = express.Router()

const {
	register,
	accountActivation,
	login,
	forgotPassword,
	resetPassword,
	googleLogin,
	facebookLogin
} = require('../controllers/authenticationControllers')

const {
	signupValidator,
	signInValidator,
	forgotPasswordValidator,
	resetPasswordValidator
} = require('../validators/authentication')
const { executeValidation } = require('../validators')

router.post('/register', signupValidator, executeValidation, register)
router.post('/account-activation', accountActivation)
router.post('/login', signInValidator, executeValidation, login)

router.put('/forgot-password', forgotPasswordValidator, executeValidation, forgotPassword)
router.put('/reset-password', resetPasswordValidator, executeValidation, resetPassword)

router.post('/google-login', googleLogin)
router.post('/facebook-login', facebookLogin)

module.exports = router
