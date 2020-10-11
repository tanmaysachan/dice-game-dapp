import React from 'react';
import './App.css';
import ReadString from "./ReadString";
import SetString from "./SetString";
import GameScreen from "./GameScreen";
import Player1 from "./Player1"
import Player2 from "./Player2"
import Player3 from "./Player3"
import Player4 from "./Player4"

import "bootstrap/dist/css/bootstrap.min.css"

import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      drizzleState: null
    }
  }
  componentDidMount() {
    const { drizzle } = this.props;
    this.unsubscribe = drizzle.store.subscribe(() => {
      const drizzleState = drizzle.store.getState();
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState });
      }
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  render() {
    if (this.state.loading) return "Loading Drizzle...";

    return (
      <Router>
        <div className="container">
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to="/" className="navbar-brand">Liar's Dice</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav mr-auto">
                <li className="navbar-item">
                  <Link to="/1" className="nav-link">player 1</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/2" className="nav-link">player 2</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/3" className="nav-link">player 3</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/4" className="nav-link">player 4</Link>
                </li>
              </ul>
            </div>
          </nav>

          <br/>

          <Route path="/1" render={(props) => <Player1 drizzle={this.props.drizzle} drizzleState={this.state.drizzleState} {...props}/>}/>
          <Route path="/2" render={(props) => <Player2 drizzle={this.props.drizzle} drizzleState={this.state.drizzleState} {...props}/>}/>
          <Route path="/3" render={(props) => <Player3 drizzle={this.props.drizzle} drizzleState={this.state.drizzleState} {...props}/>}/>
          <Route path="/4" render={(props) => <Player4 drizzle={this.props.drizzle} drizzleState={this.state.drizzleState} {...props}/>}/>
        </div>
	  </Router>
    );
  }
}

export default App;

