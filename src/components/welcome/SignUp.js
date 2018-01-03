import React, { Component } from 'react'
import axios from 'axios'

import { Link } from 'react-router-dom'
import CloseForm from '../shared/CloseForm'
import TextInputLabeled from '../shared/TextInputLabeled'
import GreenButton from '../shared/GreenButton'

const localhostUrl = 'http://localhost:2999/api/users'

class SignUp extends Component {
  constructor() {
    super()
    this.state = {
      email: '',
      password: '',
      isError: false
    }
    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleSignUp = this.handleSignUp.bind(this)
  }

  async handleSignUp (e) {
    e.preventDefault()
    const { email, password } = this.state
    try {
      await axios.post(`${localhostUrl}/register`, { email, password })
      window.localStorage.setItem('signupsuccess', true)
      window.location.href = '/login'
    } catch(error) {
      console.log('There was an error creating the user')
      this.setState({isError: true})
    }
  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value })
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value })
  }

  render() {
    return (
      <div className="outermost-container">
        <CloseForm title="Sign Up"/>
        <form onSubmit={ this.handleSignUp }>
        <TextInputLabeled label="e-mail" onChange={ this.handleEmailChange }/>
        <TextInputLabeled role="password" label="password" onChange={ this.handlePasswordChange }/>
        <div className="buttons-container">
        { this.state.isError ? <div className="error">Please check your input and try again</div> : '' }
            <GreenButton text="sign up" htmlFor='submit'/>
          </div>
        </form>
        <Link to='/login'>Already registered? Click here!</Link>
      </div>
    )
  }
}

export default SignUp;
