import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import PrivatePage from './pages/PrivatePage'
import ActivationPage from './pages/ActivationPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PrivateRoute from './components/PrivateRoute'
import AdminPage from './pages/AdminPage'
import AdminRoute from './components/AdminRoute'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'

const App = () => {
	return (
		<Router>
			 <ToastContainer />
			<Switch>
				<Route path='/' component={HomePage} exact />
				<Route path='/register' component={RegisterPage} exact />
				<Route path='/login' component={LoginPage} exact />
				<Route path='/authentication/activate/:token' component={ActivationPage} exact />
				<PrivateRoute path='/private' component={PrivatePage} exact />
				<AdminRoute path='/admin' component={AdminPage} exact />
				<Route path='/authentication/forgot-password' component={ForgotPasswordPage} exact />
				<Route path='/authentication/password/reset/:token' component={ResetPasswordPage} exact />
			</Switch>
		</Router>
	)
}

export default App
