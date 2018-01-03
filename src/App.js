import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import axios from 'axios'

import Garden from './components/garden/Garden'
import HomePlant from './components/home/HomePlant'
import Menu from './components/menu/Menu'
import History from './components/history/History'
import EditSteps from './components/forms/EditSteps'
import DeleteSteps from './components/forms/DeleteSteps'
import SignUp from './components/welcome/SignUp'
import LogIn from './components/welcome/LogIn'
import Welcome from './components/welcome/Welcome'
import PickSeed from './components/forms/PickSeed'
import Profile from './components/profile/Profile'

const localhostURL = 'http://localhost:2999/api'

class App extends Component {
  constructor() {
    super()
    const token = localStorage.getItem('token')

    if(token) {
      localStorage.setItem('logged_in', true)
      window.isAuthenticated = true
    } else {
      localStorage.setItem('logged_in', false)
      window.isAuthenticated = false
    }

    this.state = {
      loginError: false,
      authenticated: !!token,
      token: token,
      currentUser: {
        email: '',
        user_id: ''
      },
      currentPlant: {}
    }

    this.updateProgressState = this.updateProgressState.bind(this)
    this.handleAddSteps = this.handleAddSteps.bind(this)
    this.handleSignInClick = this.handleSignInClick.bind(this)
    this.handleSelectSeed = this.handleSelectSeed.bind(this)
  }

  componentDidMount() {
    this.getUserInformation()
    this.updateProgressState()
  }

  async handleAddSteps(e) {
    e.preventDefault()

    const input = e.target.querySelector('.input-field')
    const stepsAdded = parseInt(input.value, 10)
    input.value = ''

    const body = {
      user_id: this.state.currentUser.user_id,
      number_of_steps: stepsAdded
    }
    console.log(body)
    const response = await axios.post(`${localhostURL}/steps`, body)
    this.updateProgressState()
  }

  async handleSignInClick(e) {
    e.preventDefault()
    console.log('sign in')
    const email = e.target.querySelectorAll('input')[0].value
    const password = e.target.querySelectorAll('input')[1].value
    
    const body = { email, password }
    
    try {
      const response = await axios.post(`${localhostURL}/users/login`, body)
      console.log(response.data)
      let { 
        token,
        email,
        userId: user_id,
        plantInstanceId,
        plantTypeId: plant_types_id,
        progress
      } = response.data

      if(!plantInstanceId) {
        console.log('We need to pick a plant!')
        // render pick plant display
      }

      localStorage.setItem('token', token)
      window.isAuthenticated = true 
      localStorage.setItem('user_id', user_id)

      const prevState = Object.assign({}, this.state)

      this.setState({
        ...prevState,
        authenticated: true,
        loginError: false,
        token: token,
        currentUser: {
          email,
          user_id,
        },
        currentPlant: {
          plantInstanceId,
          plant_types_id,
          progress,
        },
      })
    }

    catch(error){
      console.log( 'errors', error);
      const prevState = Object.assign({}, this.state)
      this.setState({
        loginError: true,
        authenticated: false,
      })
    }
  }


  async updateProgressState() {
    const plantInstanceId = this.state.currentPlant.plant_instance_id

    const {
      data: {
        plant_instance: {
          user_id,
          plant_types_id,
          progress,
          id: plant_instance_id
        }
      }
    } = await axios.get(`${localhostURL}/plant-instances/${plantInstanceId}`)

    const {
      data: {
        plant: {
          steps_required
        }
      }
    } = await axios.get(`${localhostURL}/plant-types/${plant_types_id}`)

    const prevState = Object.assign({}, this.state)

    this.setState({
      ...prevState,
      currentPlant: {
        plant_instance_id,
        plant_types_id,
        progress,
        steps_required,
      },
    })
  }

  handleSelectSeed (e) {
    e.preventDefault()
    console.log('You have chosen plant number', e.target.id)
    const selectedPlantId = parseInt(e.target.id, 10)
    const userId = this.state.currentUser.userId

    this.updateSelectedPlantInfo({ selectedPlantId })
  }

  async updateUserInfo({ email, displayName, password }) {
    // change a user's display name or password (STRETCH)
  }

  async updateSelectedPlantInfo({ selectedPlantId }) {
    // make db call to update user's current plant to the new plant type specified
    console.log(selectedPlantId)
    const userId = localStorage.getItem('user_id')
    const body = { user_id: userId, plant_types_id: selectedPlantId }
    console.log(body)
    const response = await axios.patch(`${localhostURL}/user-profiles/${userId}`, body)
    console.log(response)
    const {
      plant_types_id,
      id: plant_instance_id
    } = response.data.result[0]

    console.log(plant_types_id, plant_instance_id)
    const prevState = Object.assign({}, this.state)
    this.setState({
      ...prevState,
      currentPlant: {
        plant_types_id,
        plantInstanceId: plant_instance_id
      }
    })
  }

  async getUserInformation() {
    // use to retrieve current user info (email, id, current plant id)
    const userId = localStorage.getItem('user_id')
    const { data: { response }} = await axios.get(`${localhostURL}/user-profiles/${userId}`)
    console.log(response)
    const { id, plant_instances_id } = response[0]
    console.log(id, plant_instances_id)
    const prevState = Object.assign({}, this.state)

    this.setState({
      ...prevState,
      currentUser: {
        user_id: id
      },
      currentPlant: {
        plant_instances_id: plant_instances_id
      }
    })
  }

  render() {
    return (
      <Router>
        <div className="outermost-container">
          <PrivateRoute path='/' exact
            component={ HomePlant }
            addSteps={this.handleAddSteps}
            plant_id={this.state.currentPlant.plant_instances_id}
            steps_recorded={this.state.currentPlant.progress}
            steps_required={this.state.currentPlant.steps_required}
          />
          <Route path='/signup' render={() => <SignUp />} />
          <Route path='/login'
            render={(routeProps) => (<LogIn {...routeProps}
              onSignIn={ this.handleSignInClick }
              loginError={ this.state.loginError }
            />)}
          />
          <Route path='/welcome' component={ Welcome } />

          <PrivateRoute path='/garden' component={ Garden } />
          <PrivateRoute path='/menu' component={ Menu } />
          <PrivateRoute path='/history' component={ History } />
          <PrivateRoute path='/editsteps' component={ EditSteps } />
          <PrivateRoute path='/deletesteps' component={ DeleteSteps } />
          <PrivateRoute path='/pickseed'
            component={ PickSeed }
            handleSelect={ this.handleSelectSeed }
            currentPlantID={ this.state.currentPlant.plant_instances_id }
          />
          <PrivateRoute path='/profile' component={ Profile } />
          <PrivateRoute path='/logout' component={ LogOut } />
        </div>
      </Router>
    )
  }
}

const LogOut = () => {
  window.isAuthenticated = false
  localStorage.removeItem('user_id')
  localStorage.removeItem('token')
  localStorage.removeItem('logged_in')

  return (
    <Redirect to={{
      pathname: '/login'
    }} />
  )
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    window.isAuthenticated ? (
      <Component {...props} {...rest} />
    ) : (
      <Redirect to={{
        pathname: '/welcome',
        state: { from: props.location }
      }}/>
    )
  )}/>
)

export default App
