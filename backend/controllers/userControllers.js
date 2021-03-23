const User = require('../models/userModel')

const read = (req, res) => {
	const userId = req.params.id

	User.findById(userId).exec((error, user) => {
		if (error || !user) {
			return res.status(400).json({
				error: 'User not found'
			})
		}

		user.hashed_password = undefined
		user.salt = undefined
		res.json(user)
	})
}

const update = (req, res) => {
	const { name, password } = req.body

	User.findOne({ _id: req.user._id }, (error, user) => {
		if (error || !user) {
			return res.status(400).json({
				error: 'User not found'
			})
		}

		if (!name) {
			return res.status(400).json({
				error: 'Name is required'
			})
		} else {
			user.name = name
		}

		if (password) {
			if (password.length < 6) {
				return res.status(400).json({
					error: 'Password should be at least 6 characters long'
				})
			} else {
				user.password = password
			}
		}

		user.save((error, updatedUser) => {
			if (error) {
				return res.status(400).json({
					error: 'User update failed'
				})
			}

			updatedUser.hashed_password = undefined
			updatedUser.salt = undefined
			res.json(updatedUser)
		})
	})
}

module.exports = { read, update }
