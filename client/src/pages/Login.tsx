import React, { useState } from 'react'; //useState lets you store and update data inside the component (like email, password, and error messages)
import { useAuth } from '../context/AuthContext'; //useAuth is a custom hook that provides authentication functionality
import { Link, useNavigate } from 'react-router-dom'; //Link is a component that allows you to navigate to different routes in your application

const Login = () => {
    const [email, setEmail] = useState(''); //useState hook is used to store the email value
    const [password, setPassword] = useState(''); //useState hook is used to store the password value
    const { login } = useAuth(); //useAuth hook is used to access the login function from the AuthContext
    const navigate = useNavigate(); //useNavigate hook is used to navigate to different routes in your application
    const [error, setError] = useState(''); //useState hook is used to store the error value

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); //prevents the default form submission behavior
        try {
            await login(email, password); //login function is called with the email and password values
            navigate('/'); //navigates to the home page
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed'); //sets the error message
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-gray-900 to-black">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 backdrop-blur-sm bg-opacity-80">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 text-center">Welcome Back</h2>
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
                    >
                        Log In
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
